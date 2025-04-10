import { useState, useEffect } from 'react';

/**
 * AutoDismissAlert - A reusable alert component that auto-dismisses after a specified time
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - The type of alert (success, error, warning, info)
 * @param {number} props.duration - Duration in ms before the alert is dismissed (default: 4000ms)
 * @param {Function} props.onDismiss - Callback function when alert is dismissed
 */
const AutoDismissAlert = ({ 
  message, 
  type = 'success', 
  duration = 4000, 
  onDismiss 
}) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!message) {
      setVisible(false);
      return;
    }
    
    setVisible(true);
    
    const timer = setTimeout(() => {
      setVisible(false);
      if (onDismiss) onDismiss();
    }, duration);
    
    return () => clearTimeout(timer);
  }, [message, duration, onDismiss]);

  if (!visible || !message) return null;

  // Define styles based on type
  const styles = {
    success: "bg-green-100 border-green-400 text-green-700",
    error: "bg-red-100 border-red-400 text-red-700",
    warning: "bg-yellow-100 border-yellow-400 text-yellow-700",
    info: "bg-blue-100 border-blue-400 text-blue-700"
  };

  return (
    <div 
      className={`mb-4 ${styles[type]} border px-4 py-3 rounded relative animate-fade-out`} 
      role="alert"
    >
      <span className="block sm:inline">{message}</span>
    </div>
  );
};

export default AutoDismissAlert; 