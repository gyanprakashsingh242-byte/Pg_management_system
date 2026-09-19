import React, { useState } from "react";

function AddTenantForm({ onAddTenant }) {
  const [formData, setFormData] = useState({
    roomNumber: "",
    tenantName: "",
    rentAmount: "",
    isPaid: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form Data Submitted:", formData);
    
    // Parent list me naya tenant add karne ke liye (State Lifting)
    if (onAddTenant) {
      onAddTenant(formData);
    }

    // Submit ke baad form inputs reset karna
    setFormData({
      roomNumber: "",
      tenantName: "",
      rentAmount: "",
      isPaid: false,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto p-6 bg-white border border-slate-200 rounded-2xl shadow-sm my-4">
      <h2 className="text-2xl font-bold text-slate-800 mb-2">Add New Tenant</h2>
      
      <div className="space-y-2">
        <label className="block">
          <span className="text-slate-700 font-medium text-sm">Room Number</span>
          <input
            type="text"
            name="roomNumber"
            value={formData.roomNumber}
            onChange={handleChange}
            placeholder="e.g. 105"
            className="w-full mt-1 border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-slate-700 font-medium text-sm">Tenant Name</span>
          <input
            type="text"
            name="tenantName"
            value={formData.tenantName}
            onChange={handleChange}
            placeholder="e.g. Suresh Kumar"
            className="w-full mt-1 border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div className="space-y-2">
        <label className="block">
          <span className="text-slate-700 font-medium text-sm">Rent Amount (₹)</span>
          <input
            type="number"
            name="rentAmount"
            value={formData.rentAmount}
            onChange={handleChange}
            placeholder="e.g. 8500"
            className="w-full mt-1 border border-slate-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </label>
      </div>

      <div className="space-y-2 pt-1">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            name="isPaid"
            checked={formData.isPaid}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
          />
          <span className="ml-2 text-slate-700 text-sm font-medium">Initial Rent Paid?</span>
        </label>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl transition focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Add Tenant
      </button>
    </form>
  );
}

export default AddTenantForm;