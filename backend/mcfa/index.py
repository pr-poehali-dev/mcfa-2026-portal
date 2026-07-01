import json
import os
import base64
import uuid
import psycopg2
import boto3


def _cors(status: int, body):
    return {
        'statusCode': status,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Password',
            'Access-Control-Max-Age': '86400',
        },
        'isBase64Encoded': False,
        'body': json.dumps(body, default=str, ensure_ascii=False),
    }


def _parse_body(event: dict) -> dict:
    raw = event.get('body') or ''
    if event.get('isBase64Encoded') and raw:
        raw = base64.b64decode(raw).decode('utf-8')
    if not raw:
        return {}
    return json.loads(raw)


def _db():
    return psycopg2.connect(os.environ['DATABASE_URL'])


def _upload_skin(data_url: str) -> str:
    _header, b64 = data_url.split(',', 1)
    raw = base64.b64decode(b64)
    key = f"skins/{uuid.uuid4().hex}.png"
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    s3.put_object(Bucket='files', Key=key, Body=raw, ContentType='image/png')
    return f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"


def handler(event: dict, context) -> dict:
    '''MCFA 2026: регистрация участников, посты, трансляции и админ-панель'''
    method = event.get('httpMethod', 'GET')
    if method == 'OPTIONS':
        return _cors(200, {})

    params = event.get('queryStringParameters') or {}
    action = params.get('action', 'posts')
    headers = event.get('headers') or {}
    admin_pass = headers.get('X-Admin-Password') or headers.get('x-admin-password')
    is_admin = bool(admin_pass and admin_pass == os.environ.get('ADMIN_PASSWORD'))

    # --- Public: list posts ---
    if method == 'GET' and action == 'posts':
        conn = _db()
        cur = conn.cursor()
        cur.execute('SELECT id, title, tag, body, created_at FROM posts ORDER BY created_at DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return _cors(200, {'posts': [
            {'id': r[0], 'title': r[1], 'tag': r[2], 'body': r[3], 'created_at': r[4]}
            for r in rows
        ]})

    # --- Public: list streams ---
    if method == 'GET' and action == 'streams':
        conn = _db()
        cur = conn.cursor()
        cur.execute('SELECT id, title, url, teams, is_live, scheduled_at, created_at FROM streams ORDER BY is_live DESC, created_at DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return _cors(200, {'streams': [
            {'id': r[0], 'title': r[1], 'url': r[2], 'teams': r[3],
             'is_live': r[4], 'scheduled_at': r[5], 'created_at': r[6]}
            for r in rows
        ]})

    # --- Admin: login ---
    if method == 'POST' and action == 'login':
        body = _parse_body(event)
        if body.get('password') == os.environ.get('ADMIN_PASSWORD'):
            return _cors(200, {'ok': True})
        return _cors(401, {'error': 'Неверный пароль'})

    # --- Public: register applicant ---
    if method == 'POST' and action == 'register':
        body = _parse_body(event)
        nick = (body.get('nick') or '').strip()
        country = (body.get('country') or '').strip()
        role_wish = (body.get('role_wish') or '').strip()
        skin = body.get('skin')
        if not nick or not country:
            return _cors(400, {'error': 'Ник и страна обязательны'})
        skin_url = None
        if skin and skin.startswith('data:image'):
            skin_url = _upload_skin(skin)
        conn = _db()
        cur = conn.cursor()
        nick_e = nick.replace("'", "''")
        country_e = country.replace("'", "''")
        role_e = role_wish.replace("'", "''")
        skin_val = "'" + skin_url.replace("'", "''") + "'" if skin_url else 'NULL'
        cur.execute(
            f"INSERT INTO applicants (nick, country, role_wish, skin_url, status) "
            f"VALUES ('{nick_e}', '{country_e}', '{role_e}', {skin_val}, 'pending') RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True, 'id': new_id})

    # --- Admin only below ---
    if not is_admin:
        return _cors(401, {'error': 'Требуется авторизация администратора'})

    # Admin: list applicants
    if method == 'GET' and action == 'applicants':
        conn = _db()
        cur = conn.cursor()
        cur.execute('SELECT id, nick, country, role_wish, skin_url, status, created_at FROM applicants ORDER BY created_at DESC')
        rows = cur.fetchall()
        cur.close()
        conn.close()
        return _cors(200, {'applicants': [
            {'id': r[0], 'nick': r[1], 'country': r[2], 'role_wish': r[3],
             'skin_url': r[4], 'status': r[5], 'created_at': r[6]}
            for r in rows
        ]})

    # Admin: update applicant status
    if method == 'PUT' and action == 'applicant':
        body = _parse_body(event)
        app_id = int(body.get('id', 0))
        status = body.get('status')
        if status not in ('approved', 'rejected', 'pending'):
            return _cors(400, {'error': 'Некорректный статус'})
        conn = _db()
        cur = conn.cursor()
        cur.execute(f"UPDATE applicants SET status = '{status}' WHERE id = {app_id}")
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True})

    # Admin: create post
    if method == 'POST' and action == 'post':
        body = _parse_body(event)
        title = (body.get('title') or '').strip()
        tag = (body.get('tag') or '').strip()
        text = (body.get('body') or '').strip()
        if not title or not text:
            return _cors(400, {'error': 'Заголовок и текст обязательны'})
        conn = _db()
        cur = conn.cursor()
        cur.execute(
            f"INSERT INTO posts (title, tag, body) VALUES ('{title.replace(chr(39), chr(39)*2)}', '{tag.replace(chr(39), chr(39)*2)}', '{text.replace(chr(39), chr(39)*2)}') RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True, 'id': new_id})

    # Admin: delete post
    if method == 'DELETE' and action == 'post':
        post_id = int(params.get('id', 0))
        conn = _db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM posts WHERE id = {post_id}")
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True})

    # Admin: create stream
    if method == 'POST' and action == 'stream':
        body = _parse_body(event)
        title = (body.get('title') or '').strip()
        url = (body.get('url') or '').strip()
        teams = (body.get('teams') or '').strip()
        scheduled_at = body.get('scheduled_at') or None
        if not title or not url:
            return _cors(400, {'error': 'Название и ссылка обязательны'})
        conn = _db()
        cur = conn.cursor()
        t_e = title.replace("'", "''")
        u_e = url.replace("'", "''")
        tm_e = teams.replace("'", "''")
        sched = f"'{scheduled_at}'" if scheduled_at else 'NULL'
        cur.execute(
            f"INSERT INTO streams (title, url, teams, is_live, scheduled_at) "
            f"VALUES ('{t_e}', '{u_e}', '{tm_e}', false, {sched}) RETURNING id"
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True, 'id': new_id})

    # Admin: toggle stream live
    if method == 'PUT' and action == 'stream':
        body = _parse_body(event)
        stream_id = int(body.get('id', 0))
        is_live = bool(body.get('is_live', False))
        live_val = 'true' if is_live else 'false'
        conn = _db()
        cur = conn.cursor()
        cur.execute(f"UPDATE streams SET is_live = {live_val} WHERE id = {stream_id}")
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True})

    # Admin: delete stream
    if method == 'DELETE' and action == 'stream':
        stream_id = int(params.get('id', 0))
        conn = _db()
        cur = conn.cursor()
        cur.execute(f"DELETE FROM streams WHERE id = {stream_id}")
        conn.commit()
        cur.close()
        conn.close()
        return _cors(200, {'ok': True})

    return _cors(404, {'error': 'Неизвестное действие'})
