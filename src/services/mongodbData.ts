// Временно используем прямое подключение к MongoDB без Mongoose
import { MongoClient } from 'mongodb';
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

export const mongodbDataService = {
  // Отделы
  async getDepartments(): Promise<DepartmentType[]> {
    await connectToDatabase();
    const departments = await Department.find({}).sort({ name: 1 }).lean();
    return departments.map(dept => ({
      ...dept,
      _id: dept._id.toString()
    }));
  },

  async createDepartment(data: CreateDepartment): Promise<DepartmentType> {
    await connectToDatabase();
    const department = await Department.create(data);
    return {
      ...department.toObject(),
      _id: department._id.toString()
    };
  },

  // Сотрудники
  async getEmployees(): Promise<EmployeeType[]> {
    await connectToDatabase();
    const employees = await Employee.find({})
      .populate('departmentId', 'name')
      .sort({ name: 1 })
      .lean();
    
    return employees.map(emp => ({
      ...emp,
      _id: emp._id.toString(),
      departmentId: emp.departmentId?.toString(),
      department: emp.departmentId ? {
        _id: emp.departmentId._id.toString(),
        name: emp.departmentId.name,
        createdAt: emp.departmentId.createdAt
      } : undefined
    }));
  },

  async createEmployee(data: CreateEmployee): Promise<EmployeeType> {
    await connectToDatabase();
    const employee = await Employee.create(data);
    return {
      ...employee.toObject(),
      _id: employee._id.toString(),
      departmentId: employee.departmentId?.toString()
    };
  },

  // Категории продуктов
  async getProductCategories(): Promise<ProductCategoryType[]> {
    await connectToDatabase();
    const categories = await ProductCategory.find({}).sort({ name: 1 }).lean();
    return categories.map(cat => ({
      ...cat,
      _id: cat._id.toString()
    }));
  },

  async createProductCategory(data: CreateProductCategory): Promise<ProductCategoryType> {
    await connectToDatabase();
    const category = await ProductCategory.create(data);
    return {
      ...category.toObject(),
      _id: category._id.toString()
    };
  },

  // Продукты
  async getProducts(): Promise<ProductType[]> {
    await connectToDatabase();
    const products = await Product.find({})
      .populate('categoryId', 'name slug')
      .sort({ name: 1 })
      .lean();
    
    return products.map(prod => ({
      ...prod,
      _id: prod._id.toString(),
      categoryId: prod.categoryId?.toString(),
      category: prod.categoryId ? {
        _id: prod.categoryId._id.toString(),
        name: prod.categoryId.name,
        slug: prod.categoryId.slug,
        createdAt: prod.categoryId.createdAt
      } : undefined
    }));
  },

  async createProduct(data: CreateProduct): Promise<ProductType> {
    await connectToDatabase();
    const product = await Product.create(data);
    return {
      ...product.toObject(),
      _id: product._id.toString(),
      categoryId: product.categoryId?.toString()
    };
  },

  // Новости
  async getNews(publishedOnly = false): Promise<NewsType[]> {
    await connectToDatabase();
    const filter = publishedOnly ? { published: true } : {};
    const news = await News.find(filter).sort({ createdAt: -1 }).lean();
    
    return news.map(item => ({
      ...item,
      _id: item._id.toString()
    }));
  },

  async createNews(data: CreateNews): Promise<NewsType> {
    await connectToDatabase();
    const news = await News.create(data);
    return {
      ...news.toObject(),
      _id: news._id.toString()
    };
  },

  // Заказы
  async getOrdersByUserId(userId: string): Promise<OrderType[]> {
    await connectToDatabase();
    const orders = await Order.find({ userId })
      .populate('items.productId', 'name price imageUrl')
      .sort({ createdAt: -1 })
      .lean();
    
    return orders.map(order => ({
      ...order,
      _id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString(),
        product: item.productId ? {
          _id: item.productId._id.toString(),
          name: item.productId.name,
          price: item.productId.price,
          imageUrl: item.productId.imageUrl,
          inStock: item.productId.inStock,
          createdAt: item.productId.createdAt
        } : undefined
      }))
    }));
  },

  async createOrder(data: CreateOrder): Promise<OrderType> {
    await connectToDatabase();
    const order = await Order.create(data);
    return {
      ...order.toObject(),
      _id: order._id.toString(),
      userId: order.userId.toString(),
      items: order.items.map(item => ({
        ...item,
        productId: item.productId.toString()
      }))
    };
  }
}; 