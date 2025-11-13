import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchListingById, updateListing as apiUpdate, publishListing as apiPublish } from '../services/listings';
import { getUser, hasToken, isEmailVerified } from '../utils/storage';

// helpers to read owner/user ids regardless of shape
const getOwnerId = (ownerId) => ownerId?.['_id'] || ownerId?.id || ownerId || '';
const getUserId  = (u) => u?._id || u?.id || '';

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 🚧 Hard gate: must be logged-in AND verified
  useEffect(() => {
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
    }
  }, [navigate]);

  const me = getUser();

  const [loaded, setLoaded] = useState(false);
  const [listing, setListing] = useState(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [addr, setAddr] = useState({ line1: '', city: '', state: '', country: '', pincode: '' });
  const [lng, setLng] = useState('');
  const [lat, setLat] = useState('');
  const [amenitiesText, setAmenitiesText] = useState('');
  const [policiesText, setPoliciesText] = useState('');

  const [existingImages, setExistingImages] = useState([]); // {url, filename}
  const [removeImages, setRemoveImages] = useState([]);     // filenames
  const [newImages, setNewImages] = useState([]);           // File[]
  const [coverImage, setCoverImage] = useState('');         // filename
  const [status, setStatus] = useState('draft');

  const [saving, setSaving] = useState(false);

  const canEdit = useMemo(() => {
    if (!listing || !me) return false;
    const myId = String(getUserId(me));
    const owner = String(getOwnerId(listing.ownerId));
    return !!myId && (myId === owner || me?.role === 'admin');
  }, [listing, me]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const payload = await fetchListingById(id);
        const l = payload?.data || payload;
        if (!mounted) return;

        setListing(l);
        setTitle(l.title || '');
        setDescription(l.description || '');
        setAddr({
          line1: l.address?.line1 || '',
          city: l.address?.city || '',
          state: l.address?.state || '',
          country: l.address?.country || '',
          pincode: l.address?.pincode || '',
        });
        const [lng0, lat0] = Array.isArray(l.location?.coordinates) ? l.location.coordinates : ['', ''];
        setLng(String(lng0 ?? ''));
        setLat(String(lat0 ?? ''));

        setAmenitiesText((l.amenities || []).join(', '));
        setPoliciesText((l.policies || []).join(', '));

        const imgs = l.images || [];
        setExistingImages(imgs);

        const match = imgs.find(it => it.url === l.coverImage || it.filename === l.coverImage);
        setCoverImage(match ? match.filename : (l.coverImage || ''));

        setStatus(l.status || 'draft');
        setLoaded(true);
      } catch (e) {
        console.error(e);
        setLoaded(true);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const onPickNewImages = (e) => setNewImages(Array.from(e.target.files || []));
  const toggleRemove = (filename) =>
    setRemoveImages((prev) => (prev.includes(filename) ? prev.filter(f=>f!==filename) : [...prev, filename]));

  const onSubmit = async (e) => {
    e.preventDefault();

    // double-check guard
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
      return;
    }

    if (!canEdit) return;

    const lngNum = Number(lng), latNum = Number(lat);
    if (
      Number.isNaN(lngNum) || Number.isNaN(latNum) ||
      lngNum < -180 || lngNum > 180 ||
      latNum < -90  || latNum > 90
    ) {
      alert('Please enter valid coordinates: lng [-180,180], lat [-90,90].');
      return;
    }

    try {
      setSaving(true);
      const fd = new FormData();

      fd.append('title', title);
      fd.append('description', description);

      fd.append('address_line1', addr.line1);
      fd.append('address_city',  addr.city);
      fd.append('address_state', addr.state);
      fd.append('address_country', addr.country);
      fd.append('address_pincode', addr.pincode);

      fd.append('location_type', 'Point');
      fd.append('lng', String(lngNum));
      fd.append('lat', String(latNum));

      const amenities = amenitiesText.split(',').map(s=>s.trim()).filter(Boolean);
      const policies  = policiesText.split(',').map(s=>s.trim()).filter(Boolean);
      amenities.forEach(a => fd.append('amenities[]', a));
      policies.forEach(p => fd.append('policies[]', p));

      if (coverImage) fd.append('coverImage', coverImage);
      if (status) fd.append('status', status);

      removeImages.forEach((fn) => fd.append('removeImages[]', fn));
      newImages.forEach((f) => fd.append('newImages', f));

      const updated = await apiUpdate(id, fd);
      const doc = updated?.data || updated;
      navigate(`/property/${doc?._id}`);
    } catch (e) {
      console.error('update error', e);
      alert(e?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const quickPublish = async (action) => {
    // guard
    if (!hasToken() || !isEmailVerified()) {
      navigate('/became-a-member', { replace: true });
      return;
    }
    try {
      const updated = await apiPublish(id, action);
      const doc = updated?.data || updated;
      setStatus(doc?.status ?? status);
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || 'Action failed');
    }
  };

  if (!loaded)   return <div className="max-w-4xl mx-auto px-4 py-6">Loading…</div>;
  if (!listing)  return <div className="max-w-4xl mx-auto px-4 py-6">Not found</div>;
  if (!canEdit)  return <div className="max-w-4xl mx-auto px-4 py-6">Not authorized</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Edit Listing</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-1 bg-gray-100 rounded-full">Status: {status}</span>
          {status !== 'published' && (
            <button onClick={()=>quickPublish('publish')} className="px-3 py-1.5 rounded bg-green-600 text-white">Publish</button>
          )}
          {status === 'published' && (
            <button onClick={()=>quickPublish('unpublish')} className="px-3 py-1.5 rounded bg-yellow-500 text-white">Unpublish</button>
          )}
          <button onClick={()=>quickPublish('archive')} className="px-3 py-1.5 rounded bg-gray-700 text-white">Archive</button>
        </div>
      </div>
      <form onSubmit={onSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium">Title *</label>
          <input className="mt-1 w-full border rounded-lg px-3 py-2" required value={title} onChange={(e)=>setTitle(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea rows={4} className="mt-1 w-full border rounded-lg px-3 py-2"
            value={description} onChange={(e)=>setDescription(e.target.value)} />
        </div>

        {/* Status (editable) */}
        <div>
          <label className="block text-sm font-medium">Status</label>
          <select
            className="mt-1 w-full border rounded-lg px-3 py-2"
            value={status}
            onChange={(e)=>setStatus(e.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="archived">Archived</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">You can also use the Publish / Unpublish / Archive buttons above.</p>
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
          <input
            className="border rounded px-3 py-2"
            placeholder="Longitude"
            type="number"
            step="any"
            min={-180}
            max={180}
            required
            value={lng}
            onChange={(e)=>setLng(e.target.value)}
          />
          <input
            className="border rounded px-3 py-2"
            placeholder="Latitude"
            type="number"
            step="any"
            min={-90}
            max={90}
            required
            value={lat}
            onChange={(e)=>setLat(e.target.value)}
          />
        </fieldset>

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Amenities (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={amenitiesText} onChange={(e)=>setAmenitiesText(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Policies (comma separated)</label>
            <input className="mt-1 w-full border rounded px-3 py-2" value={policiesText} onChange={(e)=>setPoliciesText(e.target.value)} />
          </div>
        </div>

        {/* Existing images & cover toggle (cover stored as filename) */}
        <div>
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium">Existing Images</label>
            <div className="text-xs text-gray-500">Tick to remove / Set cover</div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
            {existingImages.map((img) => {
              const checked = removeImages.includes(img.filename);
              const isCover = coverImage === img.filename;
              return (
                <label key={img.filename} className="block relative">
                  <img
                    src={img.url}
                    alt={img.filename}
                    className={`w-full aspect-video object-cover rounded ${checked ? 'opacity-40' : ''}`}
                  />
                  <div className="absolute top-2 left-2 bg-white/90 rounded px-2 py-1 text-xs">
                    <input type="checkbox" checked={checked} onChange={()=>toggleRemove(img.filename)} /> Remove
                  </div>
                  <button
                    type="button"
                    onClick={()=>setCoverImage(img.filename)} // filename (important)
                    className={`absolute bottom-2 left-2 text-xs px-2 py-1 rounded ${
                      isCover ? 'bg-black text-white' : 'bg-white/90 hover:bg-white'
                    }`}
                  >
                    {isCover ? 'Cover ✓' : 'Set cover'}
                  </button>
                </label>
              );
            })}
          </div>
        </div>

        {/* Add new */}
        <div>
          <label className="block text-sm font-medium">Add New Images</label>
          <input type="file" accept="image/*" multiple onChange={(e)=>setNewImages(Array.from(e.target.files||[]))} />
          {!!newImages.length && <div className="mt-2 text-xs text-gray-600">{newImages.length} file(s) selected</div>}
        </div>

        <div className="flex gap-2">
          <button disabled={saving} className="px-4 py-2 rounded-lg bg-black text-white hover:opacity-90 disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button type="button" onClick={()=>navigate(`/property/${id}`)} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingPage;
