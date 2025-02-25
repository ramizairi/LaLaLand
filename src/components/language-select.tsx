import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from './ui/button';
import { Languages } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';

export const LanguageSelect = () => {
  const t = useTranslations('PageInformation');

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="dark:hover:bg-peach hover:text-black p-2 cursor-pointer"
        >
          <Languages />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="bg-peach text-black border border-[#1A1F25] rounded-lg"
      >
        <Link href="/" locale="en">
          <DropdownMenuItem className="hover:!bg-snow1 hover:text-black cursor-pointer rounded-lg font-bold px-4 py-3">
            <Image src="/flags/usa.png" alt="Usa Flag" width="20" height="20" />{' '}
            {t('header.english')}
          </DropdownMenuItem>
        </Link>
        <Link href="/" locale="fr">
          <DropdownMenuItem className="hover:!bg-snow1 hover:text-black cursor-pointer rounded-lg font-bold px-4 py-3">
            <Image
              src="/flags/france.png"
              alt="French flag"
              width="20"
              height="20"
            />{' '}
            {t('header.french')}
          </DropdownMenuItem>
        </Link>
        <Link href="/" locale="ar">
          <DropdownMenuItem className="hover:!bg-snow1 hover:text-black cursor-pointer rounded-lg font-bold px-4 py-3">
            <Image
              src="/flags/tunisia.png"
              alt="Tunisia flag"
              width="20"
              height="20"
            />{' '}
            {t('header.arabic')}
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
