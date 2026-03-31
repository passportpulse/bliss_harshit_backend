"use client"
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Layout, Menu, Button, Avatar, Dropdown, message } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  LogoutOutlined, 
  DashboardOutlined,
  ShoppingOutlined,
  MenuOutlined,
  CloseOutlined
} from '@ant-design/icons';

const { Header } = Layout;
interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function EcomNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/ecom/users/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.data);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/ecom/login');
    message.success('Logged out successfully');
  };

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" onClick={() => router.push('/ecom/profile')}>
        <UserOutlined /> Profile
      </Menu.Item>
      {user?.role === 'admin' && (
        <Menu.Item key="dashboard" onClick={() => router.push('/dashboard/ecom/users')}>
          <DashboardOutlined /> Admin Dashboard
        </Menu.Item>
      )}
      <Menu.Divider />
      <Menu.Item key="logout" onClick={handleLogout}>
        <LogoutOutlined /> Logout
      </Menu.Item>
    </Menu>
  );

  const navItems = [
    {
      key: 'products',
      label: 'Products',
      icon: <ShoppingOutlined />,
      onClick: () => router.push('/ecom/products')
    },
    {
      key: 'cart',
      label: 'Cart',
      icon: <ShoppingCartOutlined />,
      onClick: () => router.push('/ecom/cart')
    }
  ];

  if (loading) {
    return <div className="h-16 bg-white shadow-sm"></div>;
  }

  return (
    <Header className="bg-white shadow-sm sticky top-0 z-50 px-4 lg:px-8">
      <div className="flex items-center justify-between h-full">
        <div className="flex items-center">
          <div className="text-xl font-bold text-indigo-600 mr-8 cursor-pointer" onClick={() => router.push('/')}>
            E-Commerce
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map(item => (
              <div
                key={item.key}
                className={`flex items-center px-3 py-2 rounded-md cursor-pointer ${
                  pathname.includes(item.key) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
                onClick={item.onClick}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button 
            type="text" 
            icon={mobileMenuVisible ? <CloseOutlined /> : <MenuOutlined />} 
            onClick={() => setMobileMenuVisible(!mobileMenuVisible)}
          />
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <Dropdown overlay={userMenu} trigger={['click']} placement="bottomRight">
              <div className="flex items-center cursor-pointer">
                <Avatar 
                  size="default" 
                  className="bg-indigo-100 text-indigo-600"
                  icon={<UserOutlined />} 
                />
                <span className="ml-2 font-medium">{user.name}</span>
              </div>
            </Dropdown>
          ) : (
            <>
              <Button 
                type="text" 
                onClick={() => router.push('/ecom/login')}
                className="text-gray-700 hover:text-indigo-600"
              >
                Sign In
              </Button>
              <Button 
                type="primary" 
                onClick={() => router.push('/ecom/signup')}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Up
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuVisible && (
        <div className="md:hidden absolute left-0 right-0 bg-white shadow-lg py-2 px-4 z-50">
          {navItems.map(item => (
            <div
              key={`mobile-${item.key}`}
              className={`flex items-center px-3 py-3 rounded-md cursor-pointer ${
                pathname.includes(item.key) ? 'text-indigo-600 bg-indigo-50' : 'text-gray-700 hover:bg-gray-50'
              }`}
              onClick={() => {
                item.onClick();
                setMobileMenuVisible(false);
              }}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </div>
          ))}
          
          <div className="border-t border-gray-200 my-2"></div>
          
          {user ? (
            <div className="px-3 py-2">
              <div className="flex items-center mb-3">
                <Avatar 
                  size="default" 
                  className="bg-indigo-100 text-indigo-600 mr-2"
                  icon={<UserOutlined />} 
                />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <Button 
                block 
                type="text" 
                className="text-left"
                onClick={() => {
                  router.push('/ecom/profile');
                  setMobileMenuVisible(false);
                }}
              >
                <UserOutlined className="mr-2" /> Profile
              </Button>
              {user.role === 'admin' && (
                <Button 
                  block 
                  type="text" 
                  className="text-left"
                  onClick={() => {
                    router.push('/dashboard/ecom/users');
                    setMobileMenuVisible(false);
                  }}
                >
                  <DashboardOutlined className="mr-2" /> Admin Dashboard
                </Button>
              )}
              <Button 
                block 
                type="text" 
                danger
                className="text-left"
                onClick={() => {
                  handleLogout();
                  setMobileMenuVisible(false);
                }}
              >
                <LogoutOutlined className="mr-2" /> Logout
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 px-3 py-2">
              <Button 
                block 
                onClick={() => {
                  router.push('/ecom/login');
                  setMobileMenuVisible(false);
                }}
              >
                Sign In
              </Button>
              <Button 
                block 
                type="primary" 
                className="bg-indigo-600"
                onClick={() => {
                  router.push('/ecom/signup');
                  setMobileMenuVisible(false);
                }}
              >
                Sign Up
              </Button>
            </div>
          )}
        </div>
      )}
    </Header>
  );
}
