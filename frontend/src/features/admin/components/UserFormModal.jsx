const defaultValues = {
  usuario_nombre: "",
  usuario_apellido: "",
  usuario_correo: "",
  rol_id: 3,
};

const UserFormModal = ({ open, onClose, onSubmit, initialValues }) => {
  if (!open) return null;

  const values = { ...defaultValues, ...(initialValues || {}) };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      usuario_nombre: formData.get("usuario_nombre"),
      usuario_apellido: formData.get("usuario_apellido"),
      usuario_correo: formData.get("usuario_correo"),
      rol_id: Number(formData.get("rol_id")),
    };
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            {initialValues ? "Editar usuario" : "Nuevo usuario"}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-sm">Cerrar</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Nombre</label>
            <input name="usuario_nombre" defaultValue={values.usuario_nombre} className="w-full border rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Apellido</label>
            <input name="usuario_apellido" defaultValue={values.usuario_apellido} className="w-full border rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Correo</label>
            <input type="email" name="usuario_correo" defaultValue={values.usuario_correo} className="w-full border rounded-md px-3 py-2 text-sm" required />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Rol</label>
            <select name="rol_id" defaultValue={values.rol_id} className="w-full border rounded-md px-3 py-2 text-sm">
              <option value={1}>Administrador</option>
              <option value={2}>Medico</option>
              <option value={3}>Paciente</option>
            </select>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-3 py-2 border rounded-md text-sm">Cancelar</button>
            <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;

import { useEffect, useState } from "react";

const defaultValues = {
  usuario_nombre: "",
  usuario_apellido: "",
  usuario_correo: "",
  usuario_telefono: "",
  usuario_cedula: "",
  rol_id: 3,
  usuario_estado: 1,
};

const Field = ({ label, children }) => (
  <label className="block text-sm">
    <span className="text-gray-700">{label}</span>
    <div className="mt-1">{children}</div>
  </label>
);

const UserFormModal = ({ open, onClose, onSubmit, initialValues }) => {
  const [values, setValues] = useState(defaultValues);
  const isEdit = !!initialValues?.usuario_id;

  useEffect(() => {
    if (open) {
      setValues({ ...defaultValues, ...initialValues });
    }
  }, [open, initialValues]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === "rol_id" || name === "usuario_estado" ? Number(value) : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(values);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-xl">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-800">
            {isEdit ? "Editar usuario" : "Crear usuario"}
          </h3>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Field label="Nombre">
              <input name="usuario_nombre" value={values.usuario_nombre} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
            </Field>
            <Field label="Apellido">
              <input name="usuario_apellido" value={values.usuario_apellido} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
            </Field>
            <Field label="Correo">
              <input type="email" name="usuario_correo" value={values.usuario_correo} onChange={handleChange} className="w-full border rounded-md px-3 py-2" required />
            </Field>
            <Field label="Teléfono">
              <input name="usuario_telefono" value={values.usuario_telefono} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label="Cédula">
              <input name="usuario_cedula" value={values.usuario_cedula} onChange={handleChange} className="w-full border rounded-md px-3 py-2" />
            </Field>
            <Field label="Rol (1=Admin,2=Médico,3=Paciente)">
              <select name="rol_id" value={values.rol_id} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value={1}>Administrador</option>
                <option value={2}>Médico</option>
                <option value={3}>Paciente</option>
              </select>
            </Field>
            <Field label="Estado">
              <select name="usuario_estado" value={values.usuario_estado} onChange={handleChange} className="w-full border rounded-md px-3 py-2">
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </Field>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-md text-gray-700">Cancelar</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md">
              {isEdit ? "Guardar cambios" : "Crear"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserFormModal;


