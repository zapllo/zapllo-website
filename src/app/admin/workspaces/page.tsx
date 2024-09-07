'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from '@/components/ui/button'

type Organization = {
  _id: string;
  companyName: string;
  industry: string;
  orgAdmin: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    whatsappNo: string;
  } | null; // OrgAdmin can be null if none is found
};

export default function Workspaces() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const response = await axios.get('/api/organization/workspace');
        const formattedData = response.data.map((org: any) => ({
          _id: org._id,
          companyName: org.companyName,
          industry: org.industry,
          orgAdmin: org.users.length > 0 ? org.users[0] : null, // Fetch first orgAdmin if exists
        }));
        setOrganizations(formattedData);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch organizations');
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, []);
console.log(organizations, 'huh?')
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Workspaces</h1>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <table className="min-w-full bg-gray-900 text-white">
          <thead>
            <tr className="text-left border-b border-gray-700">
              <th className="py-2 px-4">Organization Name</th>
              <th className="py-2 px-4">Org Admin</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">WhatsApp No</th>
              <th className="py-2 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {organizations.map((org) => (
              <tr key={org._id} className="border-b border-gray-700">
                <td className="py-2 px-4">{org.companyName}</td>
                <td className="py-2 px-4">
                  {org.orgAdmin ? `${org.orgAdmin.firstName} ${org.orgAdmin.lastName}` : 'No OrgAdmin'}
                </td>
                <td className="py-2 px-4">{org.orgAdmin?.email || 'N/A'}</td>
                <td className="py-2 px-4">{org.orgAdmin?.whatsappNo || 'N/A'}</td>
                <td className="py-2 px-4">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">View</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
