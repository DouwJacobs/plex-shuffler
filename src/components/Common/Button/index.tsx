import type { ForwardedRef } from 'react';
import React from 'react';

export type ButtonType =
  | 'default'
  | 'primary'
  | 'danger'
  | 'warning'
  | 'success'
  | 'ghost';

// Helper type to override types (overrides onClick)
type MergeElementProps<
  T extends React.ElementType,
  P extends Record<string, unknown>
> = Omit<React.ComponentProps<T>, keyof P> & P;

type ElementTypes = 'button' | 'a';

type Element<P extends ElementTypes = 'button'> = P extends 'a'
  ? HTMLAnchorElement
  : HTMLButtonElement;

type BaseProps<P> = {
  buttonType?: ButtonType;
  buttonSize?: 'default' | 'lg' | 'md' | 'sm';
  // Had to do declare this manually as typescript would assume e was of type any otherwise
  onClick?: (
    e: React.MouseEvent<P extends 'a' ? HTMLAnchorElement : HTMLButtonElement>
  ) => void;
};

type ButtonProps<P extends React.ElementType> = {
  as?: P;
} & MergeElementProps<P, BaseProps<P>>;

function Button<P extends ElementTypes = 'button'>(
  {
    buttonType = 'default',
    buttonSize = 'default',
    as,
    children,
    className,
    ...props
  }: ButtonProps<P>,
  ref?: React.Ref<Element<P>>
): JSX.Element {
  const buttonStyle = [
    'inline-flex items-center justify-center border leading-5 font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 ease-in-out cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap shadow-lg',
  ];
  switch (buttonType) {
    case 'primary':
      buttonStyle.push(
        'text-white plex-bg-primary bg-opacity-90 hover:plex-border-white hover:bg-opacity-100 active:bg-opacity-100 active:scale-95 input-action shadow-lg hover:shadow-xl focus:ring-plex-primary'
      );
      break;
    case 'danger':
      buttonStyle.push(
        'text-white bg-red-600 bg-opacity-90 border-red-500 hover:bg-opacity-100 hover:border-red-400 hover:shadow-red-500/50 focus:border-red-400 focus:ring-red-500 active:bg-red-700 active:border-red-600 active:scale-95'
      );
      break;
    case 'warning':
      buttonStyle.push(
        'text-white border border-yellow-500 bg-yellow-500 bg-opacity-90 hover:bg-opacity-100 hover:border-yellow-400 hover:shadow-yellow-500/50 focus:border-yellow-400 focus:ring-yellow-500 active:bg-opacity-100 active:border-yellow-600 active:scale-95'
      );
      break;
    case 'success':
      buttonStyle.push(
        'text-white bg-green-500 bg-opacity-90 border-green-500 hover:bg-opacity-100 hover:border-green-400 hover:shadow-green-500/50 focus:border-green-400 focus:ring-green-500 active:bg-opacity-100 active:border-green-600 active:scale-95'
      );
      break;
    case 'ghost':
      buttonStyle.push(
        'text-white bg-transparent border-zinc-600 hover:border-zinc-300 hover:bg-zinc-800/50 focus:border-zinc-300 focus:ring-zinc-500 active:border-zinc-400 active:scale-95 shadow-none'
      );
      break;
    default:
      buttonStyle.push(
        'text-zinc-200 bg-zinc-800/90 border-zinc-600 hover:text-white hover:bg-zinc-700 hover:border-zinc-500 hover:shadow-lg group-hover:text-white group-hover:bg-zinc-700 group-hover:border-zinc-500 focus:border-blue-400 focus:ring-blue-500 active:text-zinc-200 active:bg-zinc-700 active:border-zinc-600 active:scale-95'
      );
  }

  switch (buttonSize) {
    case 'sm':
      buttonStyle.push('px-3 py-1.5 text-xs button-sm gap-1.5');
      break;
    case 'lg':
      buttonStyle.push('px-6 py-3 text-base button-lg gap-2');
      break;
    case 'md':
    default:
      buttonStyle.push('px-5 py-2.5 text-sm button-md gap-2');
  }

  buttonStyle.push(className ?? '');

  if (as === 'a') {
    return (
      <a
        className={buttonStyle.join(' ')}
        {...(props as React.ComponentProps<'a'>)}
        ref={ref as ForwardedRef<HTMLAnchorElement>}
      >
        <span className="flex items-center">{children}</span>
      </a>
    );
  } else {
    return (
      <button
        className={buttonStyle.join(' ')}
        {...(props as React.ComponentProps<'button'>)}
        ref={ref as ForwardedRef<HTMLButtonElement>}
      >
        <span className="flex items-center">{children}</span>
      </button>
    );
  }
}

export default React.forwardRef(Button) as typeof Button;
