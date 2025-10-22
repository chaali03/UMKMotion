import React from 'react';
import { gsap } from 'gsap';
import './FlowingMenu.css';

// Define the type for menu items
const MenuItemType = {
  text: String,
  link: String,
  image: String
};

const animationDefaults = { duration: 0.6, ease: 'expo' };

/**
 * Menu item component with marquee animation
 */
function MenuItemComponent({ text, link, image }) {
  const itemRef = React.useRef(null);
  const marqueeRef = React.useRef(null);
  const marqueeInnerRef = React.useRef(null);

  const distMetric = (x, y, x2, y2) => {
    const xDiff = x - x2;
    const yDiff = y - y2;
    return xDiff * xDiff + yDiff * yDiff;
  };

  const findClosestEdge = (mouseX, mouseY, width, height) => {
    const topEdgeDist = distMetric(mouseX, mouseY, width / 2, 0);
    const bottomEdgeDist = distMetric(mouseX, mouseY, width / 2, height);
    return topEdgeDist < bottomEdgeDist ? 'top' : 'bottom';
  };

  const handleMouseEnter = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .set(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .set(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0)
      .to([marqueeRef.current, marqueeInnerRef.current], { y: '0%' }, 0);
  };

  const handleMouseLeave = (ev) => {
    if (!itemRef.current || !marqueeRef.current || !marqueeInnerRef.current) return;
    const rect = itemRef.current.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    const edge = findClosestEdge(x, y, rect.width, rect.height);

    gsap
      .timeline({ defaults: animationDefaults })
      .to(marqueeRef.current, { y: edge === 'top' ? '-101%' : '101%' }, 0)
      .to(marqueeInnerRef.current, { y: edge === 'top' ? '101%' : '-101%' }, 0);
  };

  const repeatedMarqueeContent = Array.from({ length: 4 }).map((_, idx) => (
    <React.Fragment key={idx}>
      <span>{text}</span>
      {image && <div className="marquee__img" style={{ backgroundImage: `url(${image})` }} />}
    </React.Fragment>
  ));

  return (
    <div className="menu__item" ref={itemRef}>
      <a 
        className="menu__item-link" 
        href={link} 
        onMouseEnter={handleMouseEnter} 
        onMouseLeave={handleMouseLeave}
      >
        <span className="menu__item-text">{text}</span>
      </a>
      <div className="marquee" ref={marqueeRef}>
        <div className="marquee__inner-wrap" ref={marqueeInnerRef}>
          <div className="marquee__inner" aria-hidden="true">
            {repeatedMarqueeContent}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * FlowingMenu component
 * @param {Object} props
 * @param {Array<{text: string, link: string, image: string}>} [props.items=[]] - Array of menu items
 */
function FlowingMenu({ items = [] }) {
  // Ensure items is always an array
  const menuItems = Array.isArray(items) ? items : [];
  
  return (
    <div className="menu-wrap">
      <nav className="menu">
        {menuItems.map((item, idx) => (
          <MenuItemComponent key={idx} {...item} />
        ))}
      </nav>
    </div>
  );
}

export default FlowingMenu;
