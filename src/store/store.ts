import { create } from 'zustand';

export enum FileType {
  PDF = "pdf",
  IMAGE = "image"
}

type PDFState = {
  uploadedPDF: File | null;
  typeFile: string;
  setUploadedPDF: (pdf: File) => void;
  setTypeFile: (type: FileType) => void;
};

const usePDF = create<PDFState>((set) => ({
  uploadedPDF: null,
  typeFile: FileType.PDF,
  setUploadedPDF: (pdf: File) => set({ uploadedPDF: pdf }),
  setTypeFile: (type: FileType) => set({ typeFile: type })
}));

export {
  usePDF
};