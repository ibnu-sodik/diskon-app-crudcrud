<template>
  <div class="app">
    <header>
      <h1>Daftar Diskon</h1>
      <div class="api-url-container">
        <input
          v-model="apiUrl"
          type="text"
          class="form-control"
          placeholder="Masukkan API URL crudcrud.com..."
        />
        <button class="btn" @click="applyApiUrl">Terapkan</button>
      </div>
    </header>

    <main>
      <DiscountList v-if="discounts.length" :discounts="discounts" />

      <div v-else class="card">
        <img src="https://cdn-icons-png.flaticon.com/512/992/992651.png" alt="Belum Ada Diskon" />
        <h2>Belum Ada Diskon</h2>
        <p>Silahkan tambah diskon untuk menarik pelanggan dan meningkatkan penjualan.</p>
        <button class="btn" @click="showForm = true">+ Tambah Diskon</button>
      </div>
    </main>

    <DiscountForm v-if="showForm" @close="showForm = false" @save="addDiscount" />

    <footer>{{ currentYear }} © PT Nusantara Berkah Digital</footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { showToast } from '@/utils/toast'
import DiscountList from './components/DiscountList.vue'
import DiscountForm from './components/DiscountForm.vue'

const currentYear = new Date().getFullYear()
const discounts = ref([])
const showForm = ref(false)
const loading = ref(false)
const error = ref(null)

const apiUrl = ref('')
const appliedUrl = ref('')

onMounted(() => {
  const storedUrl = localStorage.getItem('apiUrl')
  console.log('Stored API URL:', storedUrl)
  if (storedUrl === null) {
    showToast('API URL belum diterapkan.', 'error')
  } else {
    apiUrl.value = storedUrl
    // applyApiUrl()
    fetchData()
  }
})

const addDiscount = async (discount) => {
  if (!appliedUrl.value) {
    showToast('API URL belum diterapkan.', 'error')
    return
  }

  try {
    const res = await axios.post(appliedUrl.value, discount)
    await fetchData()
    showForm.value = false
    showToast('Data berhasil disimpan.', 'success')
  } catch (err) {
    console.error('Gagal menyimpan:', err)
    showToast('Gagal menyimpan data.', 'error')
  }
}

const applyApiUrl = async () => {
  if (!apiUrl.value) {
    showToast('Masukkan URL API terlebih dahulu.', 'error')
    return
  }

  if (!apiUrl.value.startsWith('https://crudcrud.com/api/')) {
    showToast('URL API harus dimulai dengan https://crudcrud.com/api/', 'error')
    return
  }

  appliedUrl.value = apiUrl.value
  localStorage.setItem('apiUrl', appliedUrl.value)
  const storedUrl = localStorage.getItem('apiUrl')
  if (storedUrl !== null || storedUrl !== '') {
    showToast('API URL diterapkan.', 'success')
    fetchData()
  } else {
    showToast('Gagal menerapkan API URL.', 'error')
  }
}

const fetchData = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await axios.get(appliedUrl.value)
    const data = res.data
    discounts.value = Array.isArray(data) ? data : [data]
  } catch (err) {
    error.value = err.message
    discounts.value = []
  } finally {
    loading.value = false
  }
}
</script>

<style>
body {
  font-family: Arial, sans-serif;
  background: #f9fafb;
  margin: 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
header {
  margin-bottom: 20px;
}
h1 {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
}
select {
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 14px;
}
main {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.card {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  padding: 40px;
  text-align: center;
  /* max-width: 1000px; */
  width: 100%;
}
.card img {
  width: 150px;
  margin-bottom: 20px;
}
.card h2 {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}
.card p {
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
}
.btn {
  background: #16a34a;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  width: 50%;
}
.btn:hover {
  background: #15803d;
}
footer {
  text-align: left;
  font-size: 12px;
  color: #555;
  margin-top: 20px;
}
.api-url-container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 50vw;
}
</style>
