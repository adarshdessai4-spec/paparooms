import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createListing as apiCreate } from '../services/listings';
import { ROUTES } from '../utils/constants';
import { hasToken, isEmailVerified } from '../utils/storage';

const toJSONStr = (v) => JSON.stringify(v);

const CreateListingPage = () => {
  const navigate = useNavigate();

  // 🚧 Hard gate: must be logged-in (cookie or token) AND email-verified
  useEffect(() => {
    const authed = hasToken();
    const verified = isEmailVerified();
    if (!authed || !verified) {
      navigate('/became-a-member', { replace: true });
    }
  }, [navigate]);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [addr, setAddr] = useState({ line1: '', city: '', state: '', country: '', pincode: '' });
  const [lng, setLng] = useState(''); const [lat, setLat] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [policiesText, setPoliciesText] = useState('');
  const [images, setImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const onPickImages = (e) => setImages(Array.from(e.target.files || []));

  const onSubmit = async (e) => {
    e.preventDefault();

    // double-check guard in case of race
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('title', title);
      fd.append('description', description);
      fd.append('address', toJSONStr(addr));
      fd.append('location', toJSONStr({ type: 'Point', coordinates: [Number(lng), Number(lat)] }));
      const amenities = amenitiesText.split(',').map(s=>s.trim()).filter(Boolean);
      const policies  = policiesText.split(',').map(s=>s.trim()).filter(Boolean);
      fd.append('amenities', toJSONStr(amenities));
      fd.append('policies',  toJSONStr(policies));
      images.forEach((f) => fd.append('images', f));

      const created = await apiCreate(fd);
      const doc = created?.data || created;
      navigate(`/property/${doc?._id}`);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Create Listing</h1>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" required
            value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="Hotel Sunshine" />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea rows={4} className="mt-1 w-full border rounded-lg px-3 py-2"
            value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>
        <fieldset className="grid sm:grid-cols-2 gap-3 border rounded-lg p-3">
          <legend className="px-1 text-sm font-semibold">Address</legend>
          <input className="border rounded px-3 py-2" placeholder="Line 1" required
            value={addr.line1} onChange={(e)=>setAddr({...addr, line1:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="City" required
            value={addr.city} onChange={(e)=>setAddr({...addr, city:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="State" required
            value={addr.state} onChange={(e)=>setAddr({...addr, state:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Country" required
            value={addr.country} onChange={(e)=>setAddr({...addr, country:e.target.value})} />
          <input className="border rounded px-3 py-2" placeholder="Pincode" required
            value={addr.pincode} onChange={(e)=>setAddr({...addr, pincode:e.target.value})} />
        </fieldset>
        <fieldset className="grid sm:grid-cols-2 gap-3 border rounded-lg p-3">
          <legend className="px-1 text-sm font-semibold">Location</legend>
          <input className="border rounded px-3 py-2" placeholder="Longitude" type="number" step="any" required
            value={lng} onChange={(e)=>setLng(e.target.value)} />
          <input className="border rounded px-3 py-2" placeholder="Latitude" type="number" step="any" required
            value={lat} onChange={(e)=>setLat(e.target.value)} />
        </fieldset>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Amenities (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2"
              value={amenitiesText} onChange={(e)=>setAmenitiesText(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Policies (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2"
              value={policiesText} onChange={(e)=>setPoliciesText(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Images *</label>
          <input type="file" accept="image/*" multiple onChange={onPickImages} required className="mt-1 border " />
          {!!images.length && <div className="mt-2 text-xs text-gray-600">{images.length} file(s) selected</div>}
        </div>
        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60">
            {saving ? 'Saving…' : 'Create'}
          </button>
          <button type="button" className="px-4 py-2 rounded-lg border" onClick={()=>navigate(ROUTES.LISTINGS)}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListingPage;
