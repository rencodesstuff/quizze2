import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Tab {
  name: string;
  icon: React.ElementType;
  content: any[];
}

interface TabComponentProps {
  tabs: Tab[];
  renderContent: (content: any[], activeTab: number) => React.ReactNode;
}

const TabComponent: React.FC<TabComponentProps> = ({ tabs, renderContent }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [tabSizes, setTabSizes] = useState<{ width: number; left: number }[]>([]);
  const tabsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (tabsRef.current) {
      const tabElements = tabsRef.current.querySelectorAll('button');
      const sizes = Array.from(tabElements).map(tab => ({
        width: tab.offsetWidth,
        left: tab.offsetLeft,
      }));
      setTabSizes(sizes);
    }
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="mb-6">
        <div ref={tabsRef} className="flex border-b relative">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex items-center px-4 py-2 font-semibold text-sm focus:outline-none ${
                activeTab === index ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {React.createElement(tab.icon, { className: "w-5 h-5 mr-2" })}
              {tab.name}
            </button>
          ))}
          {tabSizes.length > 0 && (
            <motion.div
              className="absolute bottom-0 h-0.5 bg-blue-600"
              initial={false}
              animate={{
                width: tabSizes[activeTab]?.width || 0,
                x: tabSizes[activeTab]?.left || 0,
              }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          )}
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full overflow-y-auto"
          >
            {renderContent(tabs[activeTab].content, activeTab)}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TabComponent;