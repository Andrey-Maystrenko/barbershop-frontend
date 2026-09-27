import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title = '', 
  variant = 'default',
  className = '',
}) => {
  const classes = ['card', `card-${variant}`, className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {title && <div className="card-title">{title}</div>}
      <div className="card-body">{children}</div>
    </div>
  );
};

export default Card;