'use client';
import SheetSettings from './modals/sheet-setting';
import { LanguageSelect } from './language-select';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
interface NavbarProps {
  quizCount?: number;
}

export const Navbar = ({ quizCount }: NavbarProps) => {
  const t = useTranslations('PageInformation');

  return (
    <header className="py-6 border-b border-snow bg-snow1">
      <div className="container mx-auto flex w-full px-6 sm:px-4 justify-between sm:justify-between gap-3 sm:gap-0 sm:items-center">
        <nav className="flex flex-col min-[540px]w-[30%] sm:w-auto sm:flex-row sm:items-center gap-2">
          <span className="flex items-center gap-2">
            <Image
              src={'/logo/logo-simple.svg'}
              width={150}
              height={150}
              alt="Logo"
            />
            {!globalThis?.localStorage?.getItem('apiKey') && (
              <span className="text-lg text-black">
                ({quizCount}/5) {t('header.count')}
              </span>
            )}
          </span>
        </nav>
        <nav className="flex items-center gap-4 w-[30%] min-[540px]:w-[20%] justify-end sm:w-auto">
          <LanguageSelect />
          <SheetSettings />
        </nav>
      </div>
    </header>
  );
};
