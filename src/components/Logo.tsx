const LOGO_URL =
  'https://cdn.poehali.dev/projects/03c39951-0df9-473a-9e75-b8e2a7af085a/bucket/0b5081d9-befc-4967-b393-4061e658bbf4.jpg';

const Logo = ({ className = 'h-9' }: { className?: string }) => (
  <img src={LOGO_URL} alt="MCFA 2026" className={`${className} w-auto object-contain`} />
);

export default Logo;
