'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Card, Tag, Button, Typography, Empty, Space, Badge, Dropdown, Menu, message } from 'antd';
import { 
  ShoppingCartOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  CloseCircleOutlined, 
  MoreOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  TruckOutlined,
  UndoOutlined
} from '@ant-design/icons';
import EcomNavbar from '@/components/EcomNavbar';
import ProtectedRoute from '@/components/ProtectedRoute';

const { Title, Text } = Typography;

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
}

const OrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data - in a real app, fetch from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        // In a real app, you would fetch orders from your API
        // const response = await fetch('/api/ecom/orders');
        // const data = await response.json();
        
        // Mock data
        setTimeout(() => {
          const mockOrders: Order[] = [
            {
              id: 'order-1',
              orderNumber: 'ORD-123456',
              date: '2023-06-15T10:30:00Z',
              status: 'delivered',
              items: [
                {
                  id: 'item-1',
                  name: 'Wireless Headphones',
                  price: 99.99,
                  quantity: 1,
                  image: 'https://picsum.photos/100/100?random=1',
                },
                {
                  id: 'item-2',
                  name: 'USB-C Cable',
                  price: 12.99,
                  quantity: 2,
                  image: 'https://picsum.photos/100/100?random=2',
                },
              ],
              subtotal: 125.97,
              shipping: 9.99,
              tax: 12.60,
              total: 148.56,
              shippingAddress: {
                name: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'United States',
              },
              paymentMethod: 'Visa ending in 4242',
              trackingNumber: '1Z999AA1234567890',
            },
            {
              id: 'order-2',
              orderNumber: 'ORD-123455',
              date: '2023-06-10T14:22:00Z',
              status: 'shipped',
              items: [
                {
                  id: 'item-3',
                  name: 'Smart Watch',
                  price: 199.99,
                  quantity: 1,
                  image: 'https://picsum.photos/100/100?random=3',
                },
              ],
              subtotal: 199.99,
              shipping: 0,
              tax: 20.00,
              total: 219.99,
              shippingAddress: {
                name: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'United States',
              },
              paymentMethod: 'PayPal',
              trackingNumber: '1Z999BB1234567890',
            },
            {
              id: 'order-3',
              orderNumber: 'ORD-123454',
              date: '2023-06-05T09:15:00Z',
              status: 'processing',
              items: [
                {
                  id: 'item-4',
                  name: 'Bluetooth Speaker',
                  price: 59.99,
                  quantity: 1,
                  image: 'https://picsum.photos/100/100?random=4',
                },
                {
                  id: 'item-5',
                  name: 'Phone Case',
                  price: 19.99,
                  quantity: 1,
                  image: 'https://picsum.photos/100/100?random=5',
                },
              ],
              subtotal: 79.98,
              shipping: 5.99,
              tax: 8.00,
              total: 93.97,
              shippingAddress: {
                name: 'John Doe',
                address: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'United States',
              },
              paymentMethod: 'Mastercard ending in 4242',
            },
          ];
          
          setOrders(mockOrders);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'delivered':
        return <Tag color="success" icon={<CheckCircleOutlined />}>Delivered</Tag>;
      case 'shipped':
        return <Tag color="blue" icon={<TruckOutlined />}>Shipped</Tag>;
      case 'processing':
        return <Tag color="processing" icon={<ClockCircleOutlined />}>Processing</Tag>;
      case 'cancelled':
        return <Tag color="error" icon={<CloseCircleOutlined />}>Cancelled</Tag>;
      default:
        return <Tag>Pending</Tag>;
    }
  };

  const filteredOrders = filterStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === filterStatus);

  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'orderNumber',
      key: 'orderNumber',
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: OrderItem[]) => (
        <Text>{items.reduce((sum, item) => sum + item.quantity, 0)} items</Text>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (total: number) => `$${total.toFixed(2)}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Button 
          type="link" 
          onClick={() => {
            setSelectedOrder(record);
            setShowOrderDetails(true);
          }}
        >
          View Details
        </Button>
      ),
    },
  ];

  const handleCancelOrder = (orderId: string) => {
    // In a real app, you would make an API call to cancel the order
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: 'cancelled' } : order
    ));
    message.success('Order has been cancelled');
  };

  const handleReturnOrder = (orderId: string) => {
    // In a real app, you would handle the return process
    message.info('Return request has been submitted');  
  };

  const OrderDetails = ({ order }: { order: Order }) => {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Title level={4} className="mb-1">Order {order.orderNumber}</Title>
            <Text type="secondary">
              Placed on {new Date(order.date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </div>
          
          <div className="text-right">
            <div className="mb-1">
              {getStatusTag(order.status)}
            </div>
            {order.trackingNumber && (
              <Text type="secondary" className="text-sm">
                Tracking #{order.trackingNumber}
              </Text>
            )}
          </div>
        </div>
        
        <Card>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <Title level={5} className="mb-4">Shipping Address</Title>
              <div className="space-y-1">
                <div>{order.shippingAddress.name}</div>
                <div>{order.shippingAddress.address}</div>
                <div>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</div>
                <div>{order.shippingAddress.country}</div>
              </div>
              
              <Title level={5} className="mt-6 mb-4">Payment Method</Title>
              <div>{order.paymentMethod}</div>
              
              <div className="mt-6">
                <Button 
                  type="default" 
                  icon={<UndoOutlined />} 
                  onClick={() => handleReturnOrder(order.id)}
                  disabled={order.status !== 'delivered'}
                  className="mr-2"
                >
                  Return Items
                </Button>
                
                {order.status !== 'cancelled' && order.status !== 'delivered' && (
                  <Button 
                    danger 
                    onClick={() => handleCancelOrder(order.id)}
                  >
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
            
            <div>
              <Title level={5} className="mb-4">Order Summary</Title>
              <div className="space-y-4">
                {order.items.map(item => (
                  <div key={item.id} className="flex justify-between items-start pb-4 border-b border-gray-100">
                    <div className="flex">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-gray-500">Qty: {item.quantity}</div>
                        <div className="text-sm">${item.price.toFixed(2)} each</div>
                      </div>
                    </div>
                    <div className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="space-y-2 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>{order.shipping > 0 ? `$${order.shipping.toFixed(2)}` : 'Free'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                  
                  <div className="border-t border-gray-200 my-2"></div>
                  
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        <div className="flex justify-end">
          <Button 
            type="primary" 
            onClick={() => setShowOrderDetails(false)}
          >
            Back to Orders
          </Button>
        </div>
      </div>
    );
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <EcomNavbar />
        
        <div className="container mx-auto px-4 py-8">
          {showOrderDetails && selectedOrder ? (
            <div>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => setShowOrderDetails(false)}
                className="mb-4"
              >
                Back to Orders
              </Button>
              <OrderDetails order={selectedOrder} />
            </div>
          ) : (
            <>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <Title level={2} className="mb-4 md:mb-0">My Orders</Title>
                
                <div className="flex items-center gap-2">
                  <span className="text-gray-600 mr-2">Filter:</span>
                  <Dropdown
                    overlay={
                      <Menu selectedKeys={[filterStatus]}>
                        <Menu.Item key="all" onClick={() => setFilterStatus('all')}>
                          All Orders
                        </Menu.Item>
                        <Menu.Item key="processing" onClick={() => setFilterStatus('processing')}>
                          Processing
                        </Menu.Item>
                        <Menu.Item key="shipped" onClick={() => setFilterStatus('shipped')}>
                          Shipped
                        </Menu.Item>
                        <Menu.Item key="delivered" onClick={() => setFilterStatus('delivered')}>
                          Delivered
                        </Menu.Item>
                        <Menu.Item key="cancelled" onClick={() => setFilterStatus('cancelled')}>
                          Cancelled
                        </Menu.Item>
                      </Menu>
                    }
                    trigger={['click']}
                  >
                    <Button>
                      {filterStatus === 'all' ? 'All Orders' : 
                       filterStatus === 'processing' ? 'Processing' :
                       filterStatus === 'shipped' ? 'Shipped' :
                       filterStatus === 'delivered' ? 'Delivered' : 'Cancelled'}
                      <MoreOutlined />
                    </Button>
                  </Dropdown>
                </div>
              </div>
              
              <Card>
                {filteredOrders.length > 0 ? (
                  <Table 
                    columns={columns} 
                    dataSource={filteredOrders} 
                    rowKey="id"
                    loading={loading}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showTotal: (total) => `Total ${total} orders`,
                    }}
                  />
                ) : (
                  <Empty 
                    description={
                      <div className="py-8">
                        <ShoppingCartOutlined className="text-4xl text-gray-300 mb-4" />
                        <div className="text-lg text-gray-600 mb-4">
                          {filterStatus === 'all' 
                            ? 'You have no orders yet' 
                            : `No ${filterStatus} orders found`}
                        </div>
                        {filterStatus === 'all' ? (
                          <Button 
                            type="primary" 
                            onClick={() => router.push('/ecom/products')}
                          >
                            Start Shopping
                          </Button>
                        ) : (
                          <Button 
                            type="default" 
                            onClick={() => setFilterStatus('all')}
                          >
                            View All Orders
                          </Button>
                        )}
                      </div>
                    }
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default OrdersPage;
