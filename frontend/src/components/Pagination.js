import React from 'react';
import { useTranslation } from 'react-i18next';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    const { t } = useTranslation();
    const pages = [...Array(totalPages).keys()].map(i => i + 1);

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px', color: 'var(--text-color)' }}>
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                    padding: '8px 15px',
                    backgroundColor: 'var(--button-bg-color)',
                    color: 'var(--button-text-color)',
                    border: '1px solid var(--button-bg-color)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    marginRight: '10px',
                    opacity: currentPage === 1 ? 0.6 : 1,
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease'
                }}
            >
                {t('back')}
            </button>
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    style={{
                        fontWeight: currentPage === page ? 'bold' : 'normal',
                        margin: '0 5px',
                        padding: '8px 12px',
                        backgroundColor: currentPage === page ? 'var(--accent-color)' : 'var(--secondary-color)',
                        color: currentPage === page ? 'var(--button-text-color)' : 'var(--text-color)',
                        border: '1px solid var(--input-border-color)',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        fontSize: '0.9em',
                        transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease'
                    }}
                >
                    {page}
                </button>
            ))}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                    padding: '8px 15px',
                    backgroundColor: 'var(--button-bg-color)',
                    color: 'var(--button-text-color)',
                    border: '1px solid var(--button-bg-color)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '0.9em',
                    marginLeft: '10px',
                    opacity: currentPage === totalPages ? 0.6 : 1,
                    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease'
                }}
            >
                {t('forward')}
            </button>
        </div>
    );
};

export default Pagination;
