import { MongoClient, ObjectId } from 'mongodb';
import type {
  Department as DepartmentType,
  Employee as EmployeeType,
  ProductCategory as ProductCategoryType,
  Product as ProductType,
  News as NewsType,
  Order as OrderType,
  CreateDepartment,
  CreateEmployee,
  CreateProductCategory,
  CreateProduct,
  CreateNews,
  CreateOrder
} from '@/types/mongodb';

const MONGODB_URI = import.meta.env.VITE_MONGODB_URI || 'mongodb://localhost:27017/tech-site-craft';

let client: MongoClient | null = null;

async function getDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
  }
  return client.db();
}

export const mongodbDataService = {
  // Отделы
  async getDepartments(): Promise<DepartmentType[]> {
    const db = await getDatabase();
    const departments = await db.collection('departments').find({}).sort({ name: 1 }).toArray();
    return departments.map(dept => ({
      ...dept,
      _id: dept._id.toString()
    }));
  },

  async createDepartment(data: CreateDepartment): Promise<DepartmentType> {
    const db = await getDatabase();
    const result = await db.collection('departments').insertOne({
      ...data,
      createdAt: new Date()
    });
    
    const department = await db.collection('departments').findOne({ _id: result.insertedId });
    return {
      ...department,
      _id: department!._id.toString()
    };
  },

  // Сотрудники
  async getEmployees(): Promise<EmployeeType[]> {
    const db = await getDatabase();
    const employees = await db.collection('employees').find({}).sort({ name: 1 }).toArray();
    
    // Получаем информацию об отделах для каждого сотрудника
    const employeesWithDepartments = await Promise.all(
      employees.map(async (emp) => {
        let department = undefined;
        if (emp.departmentId) {
          const dept = await db.collection('departments').findOne({ _id: emp.departmentId });
          if (dept) {
            department = {
              _id: dept._id.toString(),
              name: dept.name,
              description: dept.description,
              createdAt: dept.createdAt
            };
          }
        }
        
        return {
          ...emp,
          _id: emp._id.toString(),
          departmentId: emp.departmentId?.toString(),
          department
        };
      })
    );
    
    return employeesWithDepartments;
  },

  async createEmployee(data: CreateEmployee): Promise<EmployeeType> {
    const db = await getDatabase();
    const employeeData = {
      ...data,
      departmentId: data.departmentId ? new ObjectId(data.departmentId) : undefined,
      createdAt: new Date()
    };
    
    const result = await db.collection('employees').insertOne(employeeData);
    const employee = await db.collection('employees').findOne({ _id: result.insertedId });
    
    return {
      ...employee,
      _id: employee!._id.toString(),
      departmentId: employee!.departmentId?.toString()
    };
  },

  // Категории продуктов
  async getProductCategories(): Promise<ProductCategoryType[]> {
    const db = await getDatabase();
    const categories = await db.collection('productcategories').find({}).sort({ name: 1 }).toArray();
    return categories.map(cat => ({
      ...cat,
      _id: cat._id.toString()
    }));
  },

  async createProductCategory(data: CreateProductCategory): Promise<ProductCategoryType> {
    const db = await getDatabase();
    const result = await db.collection('productcategories').insertOne({
      ...data,
      createdAt: new Date()
    });
    
    const category = await db.collection('productcategories').findOne({ _id: result.insertedId });
    return {
      ...category,
      _id: category!._id.toString()
    };
  },

  // Продукты
  async getProducts(): Promise<ProductType[]> {
    const db = await getDatabase();
    const products = await db.collection('products').find({}).sort({ name: 1 }).toArray();
    
    // Получаем информацию о категориях для каждого продукта
    const productsWithCategories = await Promise.all(
      products.map(async (prod) => {
        let category = undefined;
        if (prod.categoryId) {
          const cat = await db.collection('productcategories').findOne({ _id: prod.categoryId });
          if (cat) {
            category = {
              _id: cat._id.toString(),
              name: cat.name,
              slug: cat.slug,
              createdAt: cat.createdAt
            };
          }
        }
        
        return {
          ...prod,
          _id: prod._id.toString(),
          categoryId: prod.categoryId?.toString(),
          category
        };
      })
    );
    
    return productsWithCategories;
  },

  async createProduct(data: CreateProduct): Promise<ProductType> {
    const db = await getDatabase();
    const productData = {
      ...data,
      categoryId: data.categoryId ? new ObjectId(data.categoryId) : undefined,
      createdAt: new Date()
    };
    
    const result = await db.collection('products').insertOne(productData);
    const product = await db.collection('products').findOne({ _id: result.insertedId });
    
    return {
      ...product,
      _id: product!._id.toString(),
      categoryId: product!.categoryId?.toString()
    };
  },

  // Новости
  async getNews(publishedOnly = false): Promise<NewsType[]> {
    const db = await getDatabase();
    const filter = publishedOnly ? { published: true } : {};
    const news = await db.collection('news').find(filter).sort({ createdAt: -1 }).toArray();
    
    return news.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
  },

  async createNews(data: CreateNews): Promise<NewsType> {
    const db = await getDatabase();
    const result = await db.collection('news').insertOne({
      ...data,
      createdAt: new Date()
    });
    
    const news = await db.collection('news').findOne({ _id: result.insertedId });
    return {
      ...news,
      _id: news!._id.toString()
    };
  },

  // Заказы
  async getOrdersByUserId(userId: string): Promise<OrderType[]> {
    const db = await getDatabase();
    const orders = await db.collection('orders').find({ userId: new ObjectId(userId) }).sort({ createdAt: -1 }).toArray();
    
    return orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items.map((item: any) => ({
        ...item,
        productId: item.productId.toString()
      }))
    }));
  },

  async createOrder(data: CreateOrder): Promise<OrderType> {
    const db = await getDatabase();
    const orderData = {
      ...data,
      userId: data.userId ? new ObjectId(data.userId) : undefined,
      createdAt: new Date()
    };
    
    const result = await db.collection('orders').insertOne(orderData);
    const order = await db.collection('orders').findOne({ _id: result.insertedId });
    
    return {
      ...order,
      _id: order!._id.toString(),
      userId: order!.userId?.toString()
    };
  },

  // Статистика
  async getStats() {
    const db = await getDatabase();
    
    const [
      products,
      orders,
      users,
      departments,
      totalRevenue
    ] = await Promise.all([
      // Количество товаров
      db.collection('products').countDocuments(),
      
      // Количество заказов
      db.collection('orders').countDocuments(),
      
      // Количество пользователей
      db.collection('users').countDocuments(),
      
      // Количество отделов
      db.collection('departments').countDocuments(),
      
      // Общая выручка
      db.collection('orders').aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).toArray().then(result => result[0]?.total || 0)
    ]);

    // Статистика за последний месяц
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const [
      monthlyOrders,
      monthlyRevenue,
      monthlyUsers
    ] = await Promise.all([
      // Заказы за месяц
      db.collection('orders').countDocuments({
        createdAt: { $gte: lastMonth }
      }),
      
      // Выручка за месяц
      db.collection('orders').aggregate([
        { 
          $match: { 
            status: 'delivered',
            createdAt: { $gte: lastMonth }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]).toArray().then(result => result[0]?.total || 0),
      
      // Новые пользователи за месяц
      db.collection('users').countDocuments({
        createdAt: { $gte: lastMonth }
      })
    ]);

    return {
      products,
      orders,
      users,
      departments,
      totalRevenue,
      monthlyStats: {
        orders: monthlyOrders,
        revenue: monthlyRevenue,
        newUsers: monthlyUsers
      }
    };
  }
};

export default mongodbDataService; 