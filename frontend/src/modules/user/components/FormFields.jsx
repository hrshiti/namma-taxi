import React from 'react';

export const InputField = ({ label, icon, ...props }) => (
    <div className="relative group">
        <div className="relative">
            {icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors">
                    {icon}
                </div>
            )}
            <input 
                {...props} 
                className={`form-input ${icon ? 'pl-10' : ''}`} 
            />
        </div>
        {label && (
            <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1 z-10 transition-all">
                {label}
            </span>
        )}
    </div>
);

export const DateTimePicker = ({ dateValue, onDateChange, timeValue, onTimeChange, dateLabel = "Date", timeLabel = "Time" }) => (
    <div className="flex gap-2 w-full">
        <div className="relative flex-1">
            <input 
                type="date" 
                className="form-input w-full" 
                value={dateValue} 
                onChange={e => onDateChange(e.target.value)} 
            />
            <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1 z-10">
                {dateLabel}
            </span>
        </div>
        <div className="relative flex-1">
            <input 
                type="time" 
                className="form-input w-full" 
                value={timeValue} 
                onChange={e => onTimeChange(e.target.value)} 
            />
            <span className="text-[8px] font-black text-primary uppercase absolute -top-1.5 left-3 bg-white px-1 z-10">
                {timeLabel}
            </span>
        </div>
    </div>
);
