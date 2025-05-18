import React, {type ReactNode} from 'react';
import clsx from 'clsx';
import type {Props} from '@theme/Footer/Layout';

export default function FooterLayout({
  style,
  links,
  logo,
  copyright,
}: Props): ReactNode {
  return (
    <footer
      className={clsx('footer', {
        'footer--dark': style === 'dark',
      })}>
      <div className="container container-fluid">
        {links}
        {copyright && (
          <div className="footer__bottom text--center">
            {copyright}
          </div>
        )}
        {logo && <div className="footer__logo-container">{logo}</div>}
      </div>
    </footer>
  );
}
