'use client'
import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react';
import { fetchSegmentPrefetchesUsingDynamicRequest } from 'next/dist/client/components/segment-cache/cache';

const themeToggle = () => {
    const [currentTheme, setCurrentTheme] = useState<'light' | 'dark' | null>(null);
    const [icon, setIcon] = useState<React.ReactNode>(null);

    useEffect(() => {
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (!storedTheme) {
            const sysTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            setCurrentTheme(sysTheme);
            document.documentElement.setAttribute('data-theme', sysTheme);
            setIcon(sysTheme === 'light' ? <Sun className='h-6 w-6'/> : <Moon className='h-6 w-6' />);
            return;
        }
        setCurrentTheme(storedTheme)
        document.documentElement.setAttribute('data-theme', storedTheme);
        setIcon(storedTheme === 'light' ? <Sun className='h-6 w-6'/> : <Moon className='h-6 w-6' />);
        return;
    }, []);


    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme == 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        setIcon(newTheme === 'light' ? <Sun className='h-6 w-6'/> : <Moon className='h-6 w-6' />);``
    }


    return (
        <div className="flex items-center">
            <button type='button' className="text-gray-500 focus:outline-none" onClick={toggleTheme}>
                {icon}
            </button>
        </div>
        )
}

export default themeToggle;