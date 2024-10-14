<template>
  <div>
    <el-button
      class="filter-item"
      size="mini"
      type="primary"
      icon="el-icon-upload"
      @click="dialogVisible = true"
    >批量导入
    </el-button>
    <el-dialog title="导入表单" :visible.sync="dialogVisible">
      <div class="app-container">
        <div>
          <el-button
            class="filter-item"
            size="mini"
            type="primary"
            icon="el-icon-download"
            @click="downloadExceltoLocalFile()"
          >下载模板
          </el-button>
        </div>
        <uploadExcelComponent
          :on-success="handleSuccess"
          :before-upload="beforeUpload"
        />
        <el-table
          max-height="300"
          :data="tableData"
          border
          highlight-current-row
          style="width: 100%; margin-top: 20px"
        >
          <el-table-column
            v-for="item of tableHeader"
            :key="item"
            :prop="item"
            :label="item"
          />
        </el-table>
        <el-divider />
        <el-button
          style="float: right"
          type="primary"
          :loading="loading"
          @click="submitExcel()"
        >确认并导入
        </el-button>
      </div>
    </el-dialog>
  </div>

</template>

<script>

import uploadExcelComponent from '@/components/UploadExcel/index.vue'
import { downloadFile } from '@/utils'

export default {
  components: { uploadExcelComponent },
  props: {
    // eslint-disable-next-line vue/require-default-prop
    refresh: Function,
    // eslint-disable-next-line vue/require-default-prop
    downloadExcel: Function,
    // eslint-disable-next-line vue/require-default-prop
    importExcelFile: Function
  },
  data() {
    return {
      // dialog是否可见
      tableData: [],
      tableHeader: [],
      dialogVisible: false,
      loading: false,
      files: []
    }
  },
  methods: {
    downloadExceltoLocalFile() {
      this.downloadExcel()
        .then((res) => {
          downloadFile(res, '模板', 'xlsx')
        })
        .catch((err) => {
          this.$message.error = err.message
        })
    },
    // before-upload
    beforeUpload(file) {
      this.files = file
      const extension = file.name.substring(file.name.lastIndexOf('.') + 1)
      const isLt5M = file.size / 1024 / 1024 < 5
      if (extension !== 'xlsx' && extension !== 'xls') {
        this.$message({
          message: '只能上传Excel（即后缀是.xlsx或者.xls)的文件.',
          type: 'warning'
        })
        return false
      }
      if (isLt5M) {
        return true
      }

      this.$message({
        message: '请不要上传大于5MB的文件.',
        type: 'warning'
      })
      return false
    },
    handleSuccess({ header, results }) {
      this.tableData = results
      this.tableHeader = header
    },
    submitExcel() {
      // 装载成formdata数据
      const formdata = new FormData()
      formdata.append('file', this.files, this.files.name)
      this.loading = true
      this.doImport(formdata)
    },
    async doImport(data) {
      try {
        const res = await this.importExcelFile(data)
        console.log('importExcel', res)
        this.loading = false
        this.$message.success('导入成功')
        this.refresh()
        this.dialogVisible = false
      } catch (err) {
        console.log('importExcel', err)
        this.loading = false
        this.$message.error('导入失败')
      }
    }

  }
}

</script>

<style scoped>

</style>
