import React from 'react';

export default function CompareGrid({ rows }) {
  // rows = [{ point, hanafi, maliki, shafi, hanbali }]
  return (
    <div className="overflow-x-auto border rounded-xl">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left p-2">Point</th>
            <th className="text-left p-2">Hanafite</th>
            <th className="text-left p-2">Malikite</th>
            <th className="text-left p-2">Chafi‘ite</th>
            <th className="text-left p-2">Hanbalite</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r,i)=>(
            <tr key={i} className="border-t">
              <td className="p-2 font-medium">{r.point}</td>
              <td className="p-2">{r.hanafi}</td>
              <td className="p-2">{r.maliki}</td>
              <td className="p-2">{r.shafi}</td>
              <td className="p-2">{r.hanbali}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
