
import { Link } from "react-router-dom";

const Sidebar = () => {
  return (
    <aside className="w-64 bg-black text-white p-4">
      <h2 className="text-xl font-bold mb-6"><Link to="/dashboard">Invoice Generator</Link></h2>
      <nav>
        <ul>
          <li>
            <Link to="/dashboard">Dashboard</Link>
          </li>
          <li>
            <Link to="/dashboard/clients">Clients</Link>
          </li>
          <li>
            <Link to="/dashboard/invoice-list">Invoices</Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;