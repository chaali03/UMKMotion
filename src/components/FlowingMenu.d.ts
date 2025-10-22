import React from 'react';

declare module './FlowingMenu' {
  interface MenuItemProps {
    text: string;
    link: string;
    image: string;
  }

  interface FlowingMenuProps {
    items: MenuItemProps[];
  }

  const FlowingMenu: React.FC<FlowingMenuProps>;
  export default FlowingMenu;
}
