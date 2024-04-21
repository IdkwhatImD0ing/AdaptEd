import React from 'react';

interface NavBarElementProps {
  icon: React.ReactNode;
  navBarSection: string;
  additionalClass?: string; // Optional prop for an additional CSS class
}

function NavBarElement({ icon, navBarSection, additionalClass }: NavBarElementProps) {
  // Combine base class with an optional additional class
  const classNames = `navBarElement ${additionalClass || ''}`;

  return (
    <div className={classNames}>
      <div className="icon">{icon}</div>
      <p>{navBarSection}</p>
    </div>
  );
}

export default NavBarElement;
