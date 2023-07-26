import LogoIcon from '@app/assets/images/plex_shuffle_icon.png';

const Logo = () => {
  return (
    <div className="align-center flex flex-shrink-0">
      <div className="mx-auto my-8 flex w-11/12 items-center justify-center">
        <span className="px-4">
          <img src={LogoIcon.src} alt="Logo" />
        </span>
        <h2 className="text-6xl md:text-6xl lg:text-8xl">Plex Shuffler</h2>
      </div>
    </div>
  );
};

export default Logo;
