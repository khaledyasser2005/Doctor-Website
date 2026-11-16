import React from 'react';
import { SITE_FIXED_BG_IMAGE } from '../../utils/constants';

export function FixedSiteBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-[1.02]"
        style={{ backgroundImage: `url(${SITE_FIXED_BG_IMAGE})` }}
      />
      <div className="absolute inset-0 bg-[#F6F7F5]/82 dark:bg-[#080A0D]/80 backdrop-blur-[1px]" />
    </div>
  );
}
