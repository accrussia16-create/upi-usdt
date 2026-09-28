import React from 'react';

export const EasyPaisaLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-md ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
      <circle cx="50" cy="50" r="45" fill="#00A859" />
      {/* EasyPaisa iconic 'e' */}
      <path
        d="M32 52C32 41 40 33 52 33C64 33 70 41 70 51H46C46 58 51 63 58 63C63 63 67 60 69 57L74 61C70 67 64 71 57 71C43 71 32 63 32 52ZM58 41C52 41 47 45 46 47H62C62 44 58 41 58 41Z"
        fill="#FFFFFF"
      />
      <circle cx="68" cy="30" r="6" fill="#FEE600" />
    </svg>
  </div>
);

export const JazzCashLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-amber-700 shadow-md ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
      <circle cx="50" cy="50" r="45" fill="#E60000" />
      {/* JazzCash stylized 'J' and flame accent */}
      <path
        d="M58 26V54C58 62 52 68 44 68C36 68 31 63 31 56L39 55C39 59 41 62 44 62C48 62 50 59 50 54V26H58Z"
        fill="#FFFFFF"
      />
      <path
        d="M62 25C66 31 66 38 61 43C65 41 67 36 68 32C69 28 68 25 62 25Z"
        fill="#F6B800"
      />
    </svg>
  </div>
);

export const UPILogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-slate-900 border border-emerald-500/40 shadow-md ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
      {/* Official NPCI UPI arrows */}
      <path d="M42 22L66 50L42 78H26L50 50L26 22H42Z" fill="#00B050" />
      <path d="M58 22L82 50L58 78H44L68 50L44 22H58Z" fill="#FF7800" />
    </svg>
  </div>
);

export const BinanceLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-[#181A20] border border-amber-500/40 shadow-md ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
      {/* Official Binance geometric mark */}
      <path
        d="M50 20L62 32L50 44L38 32L50 20ZM72 42L84 54L72 66L60 54L72 42ZM28 42L40 54L28 66L16 54L28 42ZM50 64L62 76L50 88L38 76L50 64ZM50 50L56 56L50 62L44 56L50 50Z"
        fill="#F3BA2F"
      />
    </svg>
  </div>
);

export const USDTLogo: React.FC<{ className?: string }> = ({ className = 'w-8 h-8' }) => (
  <div className={`relative flex items-center justify-center rounded-xl bg-[#0F2A28] border border-teal-500/40 shadow-md ${className}`}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-4/5 h-4/5">
      <circle cx="50" cy="50" r="44" fill="#26A17B" />
      <path
        d="M54 44V36H68V28H32V36H46V44C32 44 22 47 22 51C22 55 32 58 46 58V72H54V58C68 58 78 55 78 51C78 47 68 44 54 44ZM50 54C38 54 30 52 30 51C30 50 38 48 50 48C62 48 70 50 70 51C70 52 62 54 50 54Z"
        fill="#FFFFFF"
      />
    </svg>
  </div>
);

export const UserAvatarLogo: React.FC<{ role?: 'admin' | 'user'; className?: string }> = ({
  role = 'user',
  className = 'w-8 h-8'
}) => (
  <div
    className={`relative flex items-center justify-center rounded-xl font-bold shadow-md ${
      role === 'admin'
        ? 'bg-gradient-to-tr from-amber-500 to-yellow-600 text-slate-950 ring-1 ring-amber-400/50'
        : 'bg-gradient-to-tr from-emerald-600 to-teal-700 text-white ring-1 ring-emerald-400/30'
    } ${className}`}
  >
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  </div>
);
