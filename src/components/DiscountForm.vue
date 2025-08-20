<template>
  <div class="modal-overlay">
    <div class="modal">
      <header class="modal-header">
        <h2>{{ mode === 'edit' ? 'Edit Diskon' : 'Tambah Diskon' }}</h2>
        <button class="close" @click="$emit('close')">×</button>
      </header>

      <div class="modal-body">
        <label>Nama Diskon</label>
        <input
          v-model="name"
          type="text"
          class="form-control"
          placeholder="Misal: Diskon opening, diskon akhir tahun"
        />
        <small v-if="errors.name" class="error-text">{{ errors.name }}</small>

        <label>Diskon</label>
        <div class="input-wrapper">
          <span v-if="type === 'Rp'" class="prefix">Rp</span>
          <input
            v-model="displayValue"
            class="form-control"
            type="text"
            min="0"
            :placeholder="type === '%' ? 'Masukkan diskon %' : 'Masukkan nominal Rp'"
            @input="handleInput"
          />
          <span v-if="type === '%'" class="suffix">%</span>
          <div class="btn-group">
            <button :class="{ active: type === '%' }" @click="setType('%')">%</button>
            <button :class="{ active: type === 'Rp' }" @click="setType('Rp')">Rp</button>
          </div>
        </div>
        <small v-if="errors.amount" class="error-text">{{ errors.amount }}</small>
      </div>

      <footer class="modal-footer">
        <button class="button btn-block" @click="handleSave">
          {{ mode === 'edit' ? 'Update' : 'Simpan' }}
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  discounts: {
    type: Array,
    default: () => [],
  },
  mode: {
    type: String,
    default: 'add', // add | edit
  },
  discountData: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['save', 'close'])

const name = ref('')
const amount = ref(0)
const type = ref('%')
const displayValue = ref('')
const errors = ref({ name: '', amount: '' })

watch(
  () => props.discountData,
  (val) => {
    if (val) {
      name.value = val.name
      amount.value = val.amount
      type.value = val.type
      displayValue.value =
        type.value === '%' ? amount.value : new Intl.NumberFormat('id-ID').format(amount.value)
    } else {
      name.value = ''
      amount.value = 0
      type.value = '%'
      displayValue.value = ''
    }
  },
  { immediate: true },
)

const handleSave = async () => {
  errors.value = { name: '', amount: '' }

  if (!name.value.trim()) {
    errors.value.name = 'Nama diskon wajib diisi'
  }
  if (amount.value <= 0) {
    errors.value.amount = 'Diskon tidak boleh kosong atau 0'
  }

  if (props.mode === 'add') {
    const duplicate = props.discounts.find((d) => d.name.toLowerCase() === name.value.toLowerCase())
    if (duplicate) {
      errors.value.name = 'Nama diskon sudah ada, gunakan nama lain'
    }
  }

  if (errors.value.name || errors.value.amount) return

  const discount = {
    ...props.discountData,
    name: name.value,
    amount: amount.value,
    type: type.value,
  }

  const saved = await emit('save', discount)
  if (saved) {
    name.value = ''
    amount.value = 0
    type.value = '%'
    displayValue.value = ''
  }
}

const setType = (val) => {
  type.value = val
  displayValue.value = ''
  amount.value = 0
}

const handleInput = (e) => {
  let val = e.target.value

  if (type.value === '%') {
    val = val.replace(/\D/g, '')
    amount.value = Number(val) || 0
    displayValue.value = val
  } else {
    val = val.replace(/\D/g, '') // ambil hanya angka
    amount.value = Number(val) || 0
    displayValue.value = new Intl.NumberFormat('id-ID').format(amount.value)
  }
}
</script>

<style scoped>
.error-text {
  color: red;
  font-size: 14px;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}
.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  width: 500px;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}
.modal-body {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.modal-footer {
  margin-top: 1.5rem;
  text-align: right;
}
.btn-save {
  background: #22c55e;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 8px;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 8px; /* jarak antar input dan tombol */
}

.input-wrapper input {
  flex: 1; /* biar input melebar sesuai sisa ruang */
  padding: 6px 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.btn-group {
  display: flex;
  gap: 6px;
}

.btn-group button {
  padding: 6px 12px;
  border: 1px solid #ccc;
  background: #f5f5f5;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-group button:hover {
  background: #e5e5e5;
}

.btn-group button.active {
  background: #249521;
  color: #fff;
  border-color: #249521;
}
</style>
