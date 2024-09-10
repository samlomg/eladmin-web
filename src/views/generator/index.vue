<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <div v-if="crud.props.searchToggle">
        <el-input v-model="query.name" clearable size="small" placeholder="请输入表名" style="width: 200px;" class="filter-item" @keyup.enter.native="crud.toQuery" />
        <rrOperation />
        <el-select v-model="query.dataBaseId" filterable class="edit-input" clearable size="mini" placeholder="数据库" @change="$forceUpdate()">
          <el-option
            v-for="item in dataBaseIds"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>
      <crudOperation>
        <el-tooltip slot="right" class="item" effect="dark" content="数据库中表字段变动时使用该功能" placement="top-start">
          <el-button
            class="filter-item"
            size="mini"
            type="success"
            icon="el-icon-refresh"
            :loading="syncLoading"
            :disabled="crud.selections.length === 0"
            @click="sync"
          >同步</el-button>
        </el-tooltip>
      </crudOperation>
    </div>
    <!--表格渲染-->
    <el-table ref="table" v-loading="crud.loading" :data="crud.data" style="width: 100%;" @selection-change="crud.selectionChangeHandler">
      <el-table-column type="selection" width="55" />
      <el-table-column :show-overflow-tooltip="true" prop="tableName" label="表名" />
      <el-table-column :show-overflow-tooltip="true" prop="engine" label="数据库引擎" />
      <el-table-column :show-overflow-tooltip="true" prop="coding" label="字符编码集" />
      <el-table-column :show-overflow-tooltip="true" prop="remark" label="备注" />
      <el-table-column prop="createTime" label="创建日期" />
      <el-table-column label="操作" width="160px" align="center" fixed="right">
        <template slot-scope="scope">
          <el-button size="mini" style="margin-right: 2px" type="text">
            <router-link :to="'/sys-tools/generator/preview/' + scope.row.tableName">
              预览
            </router-link>
          </el-button>
          <el-button
            size="mini"
            style="margin-left: -1px;margin-right: 2px"
            type="text"
            @click="toDownload(scope.row.tableName,scope.row.dataBaseId)"
          >下载</el-button>
          <el-button
            size="mini"
            style="margin-left: -1px;margin-right: 2px"
            type="text"
          >
            <router-link
              :to="'/sys-tools/generator/config/' + scope.row.tableName + '/' + scope.row.dataBaseId"
            >
              配置
            </router-link>
          </el-button>
          <el-button
            type="text"
            style="margin-left: -1px"
            size="mini"
            @click="toGen(scope.row.tableName,scope.row.dataBaseId)"
          >生成</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <pagination />
  </div>
</template>

<script>

import { generator, sync } from '@/api/generator/generator'
import { downloadFile } from '@/utils/index'
import CRUD, { presenter, header } from '@crud/crud'
import rrOperation from '@crud/RR.operation'
import crudOperation from '@crud/CRUD.operation'
import pagination from '@crud/Pagination'

export default {
  name: 'GeneratorIndex',
  components: { pagination, crudOperation, rrOperation },
  cruds() {
    return CRUD({ url: 'api/generator/tables' })
  },
  mixins: [presenter(), header()],
  data() {
    return {
      syncLoading: false,
      dataBaseIds: [
        { value: 'local', label: '系统数据库' },
        { value: '9f255bb056fb44d599d98bf3c0df175c', label: '228MSSQL' },
        { value: 'a40e427316214fc0b916b68677f08c33', label: '223MariDB' },
        { value: '23912cf55aa94205a83f8ae94e858786', label: '12GYDE' }
      ]
    }
  },
  created() {
    this.crud.optShow = {
      add: false,
      edit: false,
      del: false,
      download: false
    }
    if (this.query.dataBaseId == null || this.query.dataBaseId.length === 0) {
      this.query.dataBaseId = 'local'
    }
    console.log('in:' + this.query.dataBaseId)
  },
  methods: {

    testName(tableName) {
      console.log(tableName)
      console.log(this.query.dataBaseId)
    },
    toGen(tableName, dataBaseId) {
      // 生成代码
      generator(tableName, 0, dataBaseId).then(data => {
        this.$notify({
          title: '生成成功',
          type: 'success',
          duration: 2500
        })
      })
    },
    toDownload(tableName, dataBaseId) {
      // 打包下载
      generator(tableName, 2, dataBaseId).then(data => {
        downloadFile(data, tableName, 'zip')
      })
    },
    sync() {
      const tables = []
      this.crud.selections.forEach(val => {
        tables.push(val.tableName)
      })
      this.syncLoading = true
      sync(tables, this.query.dataBaseId)
        .then(() => {
          this.crud.refresh()
          this.crud.notify('同步成功', CRUD.NOTIFICATION_TYPE.SUCCESS)
          this.syncLoading = false
        })
        .then(() => {
          this.syncLoading = false
        })
    }
  }
}
</script>

<style scoped>

</style>
