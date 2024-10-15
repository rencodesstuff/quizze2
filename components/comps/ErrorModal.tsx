import React from 'react';
import { motion } from 'framer-motion';

interface ErrorModalProps {
  message: string;
  onClose: () => void;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ message, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white p-8 rounded-lg max-w-md w-full"
      >
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition duration-150"
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default ErrorModal;