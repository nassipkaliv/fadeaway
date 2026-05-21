import React, { createContext, useCallback, useContext, useState } from 'react';
import { IoCheckmarkCircle, IoClose, IoInformationCircle, IoWarning } from 'react-icons/io5';

const toastContext = createContext(null);

let idCounter = 0;

const iconFor = {
    success: <IoCheckmarkCircle />,
    error: <IoWarning />,
    info: <IoInformationCircle />,
};

const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const push = useCallback((message, type = 'info', timeout = 3500) => {
        const id = ++idCounter;
        setToasts((prev) => [...prev, { id, message, type }]);
        if (timeout) setTimeout(() => dismiss(id), timeout);
        return id;
    }, [dismiss]);

    const value = {
        push,
        success: (m, t) => push(m, 'success', t),
        error: (m, t) => push(m, 'error', t),
        info: (m, t) => push(m, 'info', t),
        dismiss,
    };

    return (
        <toastContext.Provider value={value}>
            {children}
            <div className="toast_container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast toast_${t.type}`} role="alert">
                        <span className="toast_icon">{iconFor[t.type] || iconFor.info}</span>
                        <span className="toast_msg">{t.message}</span>
                        <button type="button" className="toast_close" onClick={() => dismiss(t.id)} aria-label="Close">
                            <IoClose />
                        </button>
                    </div>
                ))}
            </div>
        </toastContext.Provider>
    );
};

export const useToast = () => {
    const ctx = useContext(toastContext);
    if (!ctx) {
        // Soft fallback so components don't crash if provider missing
        return { push: () => {}, success: () => {}, error: () => {}, info: () => {}, dismiss: () => {} };
    }
    return ctx;
};

export { ToastProvider };
export default toastContext;
