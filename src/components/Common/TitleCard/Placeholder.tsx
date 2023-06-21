interface PlaceholderProps {
    canExpand?: boolean;
  }
  
  const Placeholder = ({ canExpand = false }: PlaceholderProps) => {
    return (
      <div
        className={`relative animate-pulse rounded-xl plex-bg-transparent ${
          canExpand ? 'w-full' : 'w-36 sm:w-36 md:w-44'
        }`}
      >
        <div className="w-full" style={{ paddingBottom: '100%' }} />
      </div>
    );
  };
  
  export default Placeholder;