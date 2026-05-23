'use client';

import { Task } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { motion, AnimatePresence } from 'framer-motion';

interface SomedayTasksProps {
  tasks: Task[];
  partnerName?: string;
  onToggle: (id: string, isCompleted: boolean) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function SomedayTasks({ tasks, partnerName, onToggle, onEdit, onDelete }: SomedayTasksProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (tasks.length === 0) return null;

  return (
    <div className="px-6 mb-8">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 bg-zinc-100 dark:bg-zinc-900 rounded-[2rem] border border-zinc-200 dark:border-zinc-800"
      >
        <span className="font-bold text-zinc-600 dark:text-zinc-400 uppercase tracking-widest text-xs">
          Когда-нибудь ({tasks.length})
        </span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-zinc-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="space-y-4 pt-4">
              {tasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  partnerName={partnerName}
                  onToggle={onToggle}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
