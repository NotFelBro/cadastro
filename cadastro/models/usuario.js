const usuarioSchema = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    sobrenome: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: false },
    senhaHash: { type: String, required: true, select: false }
});
const Usuario = mongoose.model("Usuario", usuarioSchema, "usuarios");