import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '../ui/button';
import { Dispatch, SetStateAction } from 'react';

interface ErrorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  setStep: Dispatch<
    SetStateAction<
      'upload' | 'generate' | 'intro' | 'quiz' | 'results' | 'books'
    >
  >;
}

export const ErrorModal = ({
  open,
  onOpenChange,
  setStep
}: ErrorModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>You have reached the limit of free quizzes</DialogTitle>
          <DialogDescription className="pt-4">
            <p className="mb-4">Please set up your API key to continue.</p>
            <Button
              onClick={() => {
                onOpenChange(false);
                setStep('upload');
              }}
            >
              Return to Home
            </Button>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};
