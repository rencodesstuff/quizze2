// File: components/Modal.tsx

import React from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  isError?: boolean;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message, isError = false }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full m-4"
          onClick={(e) => e.stopPropagation()}
        >
          <h2 className={`text-2xl font-bold mb-4 ${isError ? 'text-red-600' : 'text-green-600'}`}>{title}</h2>
          <p>{message}</p>
          <button
            onClick={onClose}
            className={`mt-4 px-4 py-2 rounded-md text-white transition duration-200 ${
              isError ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Modal;