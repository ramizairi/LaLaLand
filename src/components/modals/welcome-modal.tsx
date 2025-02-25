
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { useTranslations } from 'next-intl';

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WelcomeModal = ({ open, onOpenChange }: WelcomeModalProps) => {
  const t = useTranslations('HomePage');

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="bg-[#0A0E12]">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {t('modal.title')}
          </DialogTitle>
          <DialogDescription className="pt-4">
            <p className="mb-4">
              {t('modal.freeUseInfo')}
            </p>
            <p className="mb-4">
              {t('modal.apiKeyRequirement')}
            </p>
            <p>
              {t('modal.apiKeySetupInfo')}
            </p>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};