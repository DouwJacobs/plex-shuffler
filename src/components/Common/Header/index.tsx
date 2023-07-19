interface HeaderProps {
  extraMargin?: number;
  subtext?: React.ReactNode;
  children: React.ReactNode;
}

const Header = ({ children, extraMargin = 0, subtext }: HeaderProps) => {
  return (
    <div className="mb-4 mt-8 text-center md:items-center md:justify-between">
      <div className={`min-w-0 mx-${extraMargin} `}>
        <h2
          className="mb-4 truncate text-2xl font-bold leading-7 text-txt-primary sm:overflow-visible sm:text-4xl sm:leading-9 md:mb-0"
          data-testid="page-header"
        >
          <span className="plex-color-primary">{children}</span>
        </h2>
        {subtext && <div className="mt-2 text-txt-primary">{subtext}</div>}
      </div>
    </div>
  );
};

export default Header;
