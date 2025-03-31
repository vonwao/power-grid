import { Employee } from '../components/data/mockData';

/**
 * Seeded random number generator for reproducible results
 */
class SeededRandom {
  private seed: number;
  
  constructor(seed: number) {
    this.seed = seed;
  }
  
  // Simple random number generator with seed
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
  
  // Random integer between min and max (inclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  // Random element from array
  nextElement<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }
  
  // Random boolean with probability
  nextBoolean(probability = 0.5): boolean {
    return this.next() < probability;
  }
}

// Sample data for generation
const firstNames = [
  'John', 'Jane', 'Robert', 'Emily', 'Michael', 'Sarah', 'David', 'Jennifer', 'Thomas', 'Lisa',
  'William', 'Mary', 'James', 'Patricia', 'Richard', 'Linda', 'Charles', 'Barbara', 'Joseph', 'Susan',
  'Daniel', 'Jessica', 'Matthew', 'Karen', 'Anthony', 'Nancy', 'Mark', 'Betty', 'Donald', 'Helen',
];

const lastNames = [
  'Smith', 'Johnson', 'Williams', 'Jones', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor',
  'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson',
  'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King',
];

const domains = [
  'example.com', 'test.com', 'company.com', 'mail.com', 'domain.com',
  'business.net', 'corp.org', 'enterprise.io', 'acme.co', 'startup.dev',
];

/**
 * Generate a single employee
 */
function generateEmployee(id: number, random: SeededRandom): Employee {
  const firstName = random.nextElement(firstNames);
  const lastName = random.nextElement(lastNames);
  const domain = random.nextElement(domains);
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${id}@${domain}`;
  
  // Generate a birthday between 20 and 65 years ago
  const now = new Date();
  const years = random.nextInt(20, 65);
  const month = random.nextInt(0, 11);
  const day = random.nextInt(1, 28);
  const birthday = new Date(now.getFullYear() - years, month, day);
  
  return {
    id,
    name: `${firstName} ${lastName}`,
    email,
    age: years,
    birthday,
    active: random.nextBoolean(0.8), // 80% chance of being active
    departmentId: random.nextInt(1, 10),
  };
}

/**
 * Generate a dataset of employees
 * @param count Number of employees to generate
 * @param seed Random seed for reproducible results
 * @returns Array of generated employees
 */
export function generateEmployees(count: number, seed = 12345): Employee[] {
  const random = new SeededRandom(seed);
  const employees: Employee[] = [];
  
  for (let i = 1; i <= count; i++) {
    employees.push(generateEmployee(i, random));
  }
  
  return employees;
}