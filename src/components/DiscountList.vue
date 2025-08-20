<template>
  <div class="container">
    <div class="header">
      <div>
        <h2>Daftar Diskon</h2>
        <p v-if="loading !== true">Total jumlah data: {{ discounts.length }}</p>
      </div>
      <button v-if="loading !== true" class="btn btn-green" @click="openForm">
        + Tambah Diskon
      </button>
    </div>

    <div v-if="loading !== true" class="flex-div">
      <div class="search-box">
        <input v-model="search" type="text" class="form-control" placeholder="Cari diskon" />
      </div>
      <button class="btn-delete-multi" v-if="cbMultiHapus.length > 1" @click="confirmDeleteMulti">
        Hapus {{ cbMultiHapus.length }} data
      </button>
    </div>

    <div v-if="loading === true">
      <p>Loading...</p>
    </div>
    <EasyDataTable
      v-else
      :headers="headers"
      :items="discounts"
      :rows-per-page="5"
      :search-value="search"
      alternating
      border-cell
    >
      <template #header-checkbox>
        <input type="checkbox" v-model="allSelectedCb" @change="toggleSelectAll" />
      </template>

      <template #item-checkbox="{ _id }">
        <input type="checkbox" :value="_id" v-model="cbMultiHapus" />
      </template>

      <template #item-amount="{ amount, type }">
        <span v-if="type === '%'">{{ amount }}%</span>
        <span v-else>Rp {{ formatRupiah(amount) }}</span>
      </template>

      <template #item-actions="row">
        <button class="btn-edit" @click="editDiscount(row)">Edit</button>
        <button class="btn-delete" @click="confirmDelete(row)">Hapus</button>
      </template>
    </EasyDataTable>

    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Hapus Data</h3>
        <p>
          Apakah Anda yakin ingin menghapus diskon
          <b>{{ discountToDelete?.name }}</b
          >?
          <br />
          Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeDeleteModal">Batal</button>
          <button class="btn-confirm" @click="deleteDiscount">Hapus</button>
        </div>
      </div>
    </div>

    <div v-if="showMultiDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Hapus Data</h3>
        <p>
          Apakah Anda yakin ingin menghapus
          <b>{{ cbMultiHapus.length }}</b> data?
          <br />
          Data yang dihapus tidak dapat dikembalikan.
        </p>

        <div class="modal-actions">
          <button class="btn-cancel" @click="closeDeleteModal">Batal</button>
          <button class="btn-confirm" @click="deleteMultiData">Hapus</button>
        </div>
      </div>
    </div>

    <div style="z-index: 9999">
      <DiscountForm
        v-if="showForm"
        :mode="formMode"
        :discounts="discounts"
        :discountData="selectedDiscount"
        @save="handleSave"
        @close="closeForm"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import EasyDataTable from 'vue3-easy-data-table'
import 'vue3-easy-data-table/dist/style.css'
import DiscountForm from './DiscountForm.vue'
import { showToast } from '@/utils/toast'

const search = ref('')
const discounts = ref([]) // data kosong awalnya
const loading = ref(false)
const error = ref(null)
const apiUrl = localStorage.getItem('apiUrl') || ''
const showForm = ref(false)
const formMode = ref('add')
const selectedDiscount = ref(null)

const showDeleteModal = ref(false)
const discountToDelete = ref(null)
const showMultiDeleteModal = ref(false)

const cbMultiHapus = ref([])
const allSelectedCb = ref(false)

const headers = [
  { text: '', value: 'checkbox' },
  { text: 'Nama Diskon', value: 'name' },
  { text: 'Nilai Diskon', value: 'amount' },
  { text: 'Aksi', value: 'actions' },
]

const fetchDiscounts = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(apiUrl)
    const data = res.data

    discounts.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDiscounts()
})

const formatRupiah = (angka) => {
  return new Intl.NumberFormat('id-ID').format(angka)
}

const openForm = () => {
  formMode.value = 'add'
  selectedDiscount.value = null
  showForm.value = true
}

const editDiscount = (row) => {
  formMode.value = 'edit'
  selectedDiscount.value = { ...row }
  showForm.value = true
}

const closeForm = () => {
  showForm.value = false
}
const handleSave = async (discount) => {
  try {
    if (formMode.value === 'add') {
      const res = await axios.post(apiUrl, discount)
      discounts.value.push(res.data)
      await fetchDiscounts()
    } else {
      const res = await axios.put(`${apiUrl}/${_id}`, payload)
      const index = discounts.value.findIndex((d) => d._id === _id)
      if (index !== -1) discounts.value[index] = res.data
      await fetchDiscounts()
    }
    closeForm()
    showToast('Data berhasil disimpan.', 'success')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    showToast('Gagal menyimpan data.', 'error')
  }
}

// NOTE: Hapus data

const confirmDelete = (row) => {
  discountToDelete.value = row
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  discountToDelete.value = null

  showMultiDeleteModal.value = false
}

const deleteDiscount = async () => {
  try {
    await axios.delete(`${apiUrl}/${discountToDelete.value._id}`)
    discounts.value = discounts.value.filter((d) => d._id !== discountToDelete.value._id)
    closeDeleteModal()
    showToast('Data berhasil dihapus.', 'success')
  } catch (err) {
    console.error('Gagal hapus:', err)
    showToast('Gagal menghapus data.', 'error')
  }
}

const confirmDeleteMulti = () => {
  if (cbMultiHapus.value.length === 0) return
  showMultiDeleteModal.value = true
}
const deleteMultiData = async () => {
  let jumlah = cbMultiHapus.value.length
  try {
    const promises = cbMultiHapus.value.map((id) => axios.delete(`${apiUrl}/${id}`))
    await Promise.all(promises)
    discounts.value = discounts.value.filter((d) => !cbMultiHapus.value.includes(d._id))
    cbMultiHapus.value = []
    closeDeleteModal()
    showToast(`${jumlah} data berhasil dihapus.`, 'success')
  } catch (err) {
    console.error('Gagal hapus multi:', err)
    showToast('Gagal menghapus data.', 'error')
  }
}

const toggleSelectAll = () => {
  if (allSelectedCb.value) {
    cbMultiHapus.value = discounts.value.map((d) => d._id)
  } else {
    cbMultiHapus.value = []
  }
}

watch(cbMultiHapus, (val) => {
  allSelectedCb.value = val.length === discounts.value.length && val.length > 0
})

watch(discounts, (val) => {
  if (val.length === 0) {
    cbMultiHapus.value = []
    allSelectedCb.value = false
  }
})
</script>

<style scoped>
.vue3-easy-data-table__header {
  z-index: 0;
}
.container {
  font-family: Arial, sans-serif;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  /* text-align: center; */
  /* max-width: 1000px; */
  width: 100%;
}

/* Header */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.header h2 {
  margin: 0;
  font-size: 20px;
}

.header p {
  margin: 2px 0 0;
  color: #777;
  font-size: 14px;
}

/* Button */
.btn {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  width: 20%;
}

.btn-green {
  background-color: #22c55e;
  color: white;
}

.btn-green:hover {
  background-color: #16a34a;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 18px;
}

/* Search */
.search-box {
  width: 50vw;
  margin-bottom: 15px;
}

.search-box input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
}

.btn-edit {
  background: orange;
  color: #fff;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  margin-right: 6px;
  cursor: pointer;
}
.btn-delete {
  background: #f44336;
  color: #fff;
  padding: 6px 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.btn-edit:hover,
.btn-delete:hover,
.btn-delete-multi:hover,
.btn-green:hover {
  opacity: 0.85;
}

/* --- Modal --- */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: #fff;
  padding: 20px;
  width: 400px;
  border-radius: 6px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.modal h3 {
  margin-bottom: 12px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-delete-multi {
  padding: 8px 14px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 14px;
  width: 20%;
  background: #f44336;
  color: #fff;
}
</style>
