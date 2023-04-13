import { useEffect } from 'react';

const useDocTitle = (title) => {
    useEffect(() => {
        if (title) {
            document.title = `${title} - FadeAway`;
        } else {
            document.title = 'FadeAway | The Perfect Sneakers Store for Top G';
        }
    }, [title]);

    return null;
};

export default useDocTitle;
