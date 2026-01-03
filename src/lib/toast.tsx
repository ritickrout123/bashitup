import toast, { ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'top-center',
    style: {
        background: '#fff',
        color: '#333',
        padding: '16px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        fontFamily: 'inherit',
        fontWeight: 500,
    },
};

export const showSuccessToast = (message: string) => {
    toast.success(message, {
        ...defaultOptions,
        iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
        },
        style: {
            ...defaultOptions.style,
            borderLeft: '4px solid #10B981',
        },
    });
};

export const showErrorToast = (message: string) => {
    toast.error(message, {
        ...defaultOptions,
        iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
        },
        style: {
            ...defaultOptions.style,
            borderLeft: '4px solid #EF4444',
        },
    });
};

export const showWarningToast = (message: string) => {
    toast(message, {
        ...defaultOptions,
        icon: '⚠️',
        style: {
            ...defaultOptions.style,
            borderLeft: '4px solid #F59E0B',
        },
    });
};

export const showInfoToast = (message: string) => {
    toast(message, {
        ...defaultOptions,
        icon: 'ℹ️',
        style: {
            ...defaultOptions.style,
            borderLeft: '4px solid #3B82F6',
        },
    });
};

export const withToastPromise = <T,>(
    promise: Promise<T>,
    messages: {
        loading: string;
        success: string;
        error: string;
    }
) => {
    return toast.promise(
        promise,
        {
            loading: messages.loading,
            success: messages.success,
            error: messages.error,
        },
        {
            ...defaultOptions,
            style: {
                ...defaultOptions.style,
                borderLeft: '4px solid #8B5CF6',
            },
        }
    );
};
