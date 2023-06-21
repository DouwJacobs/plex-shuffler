interface HeaderProps {
    extraMargin?: number;
    subtext?: React.ReactNode;
    children: React.ReactNode;
  }
  
  const Header = ({ children, extraMargin = 0, subtext }: HeaderProps) => {
    return (
      <div className="mt-8 mb-4 md:items-center md:justify-between text-center">
        <div className={`min-w-0 mx-${extraMargin} `}>
          <h2
            className="mb-4 truncate text-2xl font-bold leading-7 text-gray-100 sm:overflow-visible sm:text-4xl sm:leading-9 md:mb-0"
            data-testid="page-header"
          >
            <span className="plex-color-primary">{children}</span>
          </h2>
          {subtext && <div className="mt-2 text-gray-400">{subtext}</div>}
        </div>
      </div>
    );
  };
  
  export default Header;