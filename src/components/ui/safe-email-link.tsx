import React from 'react';
import { APP_CONFIG } from '@/config/app.config';

interface SafeEmailLinkProps {
  className?: string;
  showIcon?: boolean;
  children?: React.ReactNode;
}

export function SafeEmailLink({ className, showIcon = true, children }: SafeEmailLinkProps) {
  const iconHtml = showIcon ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 mr-2 inline-block"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>' : '';
  
  if (children) {
    return (
      <>
        <span dangerouslySetInnerHTML={{ __html: '<!--email_off-->' }} />
        <a href={'mailto:' + APP_CONFIG.contact.email} className={className || ''}>
          {children}
        </a>
        <span dangerouslySetInnerHTML={{ __html: '<!--/email_off-->' }} />
      </>
    );
  }

  const html = '<!--email_off--><a href="mailto:' + APP_CONFIG.contact.email + '" class="' + (className || '') + '">' + iconHtml + APP_CONFIG.contact.email + '</a><!--/email_off-->';
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
