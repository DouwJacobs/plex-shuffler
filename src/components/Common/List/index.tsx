import { withProperties } from '@app/utils/typeHelpers';

interface ListItemProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const ListItem = ({ title, className, children }: ListItemProps) => {
  return (
    <div>
      <div className="max-w-6xl py-4 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-white-400 block text-sm font-bold">{title}</dt>
        <dd className="flex text-sm text-white sm:col-span-2 sm:mt-0">
          <span className={`flex-grow ${className}`}>{children}</span>
        </dd>
      </div>
    </div>
  );
};

interface ListProps {
  title: string;
  subTitle?: string;
  children: React.ReactNode;
}

const List = ({ title, subTitle, children }: ListProps) => {
  return (
    <>
      <div>
        <h3 className="heading">{title}</h3>
        {subTitle && <p className="description">{subTitle}</p>}
      </div>
      <div className="section border-t border-zinc-700">
        <dl className="divide-y divide-zinc-700">{children}</dl>
      </div>
    </>
  );
};

export default withProperties(List, { Item: ListItem });
