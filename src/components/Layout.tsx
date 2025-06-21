import React, { ReactNode } from 'react';
import { Helmet } from 'react-helmet';
import Header from './Header';
import Footer from './Footer';
import Cart from './Cart';
import ChatWidget from './ChatWidget';
import { useCartDrawer } from '../hooks/useCartDrawer';

interface LayoutProps {
  children: ReactNode;
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
  };
}

const Layout: React.FC<LayoutProps> = ({ children, seo }) => {
  const defaultSEO = {
    title: "BT-Tech - Бытовая техника с гарантией качества",
    keywords: "бытовая техника, холодильники, стиральные машины, плиты, пылесосы, москва, доставка, гарантия",
    description: "Интернет-магазин бытовой техники BT-Tech. Широкий ассортимент, низкие цены, быстрая доставка, официальная гарантия. Холодильники, стиральные машины, плиты, пылесосы от ведущих производителей."
  };

  const currentSEO = { ...defaultSEO, ...seo };
  const { isOpen, close } = useCartDrawer();

  return (
    <>
      <Helmet>
        <title>{currentSEO.title}</title>
        <meta name="description" content={currentSEO.description} />
        <meta name="keywords" content={currentSEO.keywords} />
      </Helmet>
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </div>
      {isOpen && <Cart onClose={close} />}
      <ChatWidget />
    </>
  );
};

export default Layout;
