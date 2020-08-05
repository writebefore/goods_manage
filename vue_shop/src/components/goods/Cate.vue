<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <!-- 添加分类按钮 -->
        <el-col>
          <el-button type="primary" @click="setAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table class="treeTable" :data="catelist" :columns="columns" :selection-type="false" :expand-type="false" show-index>
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color:green;"></i>
          <i class="el-icon-error" v-else style="color:red;"></i>
        </template>

        <!-- 等级 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <div style="width:200px;">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCate(scope.row)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCate(scope.row)">删除</el-button>
          </div>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog title="添加分类" :visible.sync="showAddCateDialogVisible" width="50%" @close="addCateDialogClosed">
      <!-- 添加分类的表单 -->
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>

        <el-form-item label="父级分类：">
          <el-cascader v-model="selectedKeys" :options="parentCateList" :props="cascaderProps" @change="parentCateChanged" clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <el-dialog title="修改分类名称" :visible.sync="showEditdialogVisible" width="50%" @close="editCateDialogClosed">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="addCateFormRules">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editForm.cat_name"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditdialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="sendEditForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类的数据列表
      catelist: [],

      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      //  总数据条数
      total: 0,
      // 为table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '等级',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'opt'
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      showAddCateDialogVisible: false,

      //   添加分类表单的数据引用
      addCateForm: {
        //   将要添加的分类名称
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类的等级
        cat_level: 0
      },

      //   添加分类表单的规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类的名称', trigger: 'blur' }
        ]
      },

      //   父级分类的列表
      parentCateList: [],

      // 指定级联选择器配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        checkStrictly: 'true'
      },
      //  选中的父级分类的Id数组
      selectedKeys: [],

      // 显示编辑框
      showEditdialogVisible: false,

      // 编辑参数
      editForm: {}
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      console.log(res.data)
      this.catelist = res.data.result
      //   为总数据条数赋值
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newPagesize) {
      this.queryInfo.pagesize = newPagesize
      this.getCateList()
    },
    // 监听pageNum的改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 点击添加按钮显示对话框
    setAddCateDialog() {
      // 先获取父及分类的结果
      this.getParentCateList()
      this.showAddCateDialogVisible = true
    },
    // 获取父级分类的数据
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取数据失败')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },

    // 选择项发生变化触发函数
    parentCateChanged() {
      if (this.selectedKeys.length > 0) {
        //   父级分类的Id
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ]
        this.addCateForm.cat_level = this.selectedKeys.length
      } else {
        this.addCateForm.cat_pid = 0
        this.addCateForm.cat_level = 0
      }
      console.log(this.selectedKeys)
    },
    // 点击按钮，添加分类
    addCate() {
      console.log(this.addCateForm)
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.showAddCateDialogVisible = false
      })
    },
    // 监听对话框的关闭时间，重置表单数据
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
      this.selectedKeys = []
      this.addCateForm.cat_level = 0
      this.addCateForm.cat_pid = 0
    },

    // 打开修改表单
    async editCate(rowData) {
      const { data: res } = await this.$http.get('categories/' + rowData.cat_id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败！')
      }
      this.editForm = res.data
      this.showEditdialogVisible = true
    },

    // 修改表单关闭
    editCateDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },

    // 提交修改表单
    sendEditForm() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          'categories/' + this.editForm.cat_id,
          { cat_name: this.editForm.cat_name }
        )
        if (res.meta.status !== 200) {
          console.log(res)
          return this.$message.error('更新数据失败！')
        }
        this.$message.success('更新数据成功')
        this.showEditdialogVisible = false
        this.getCateList()
      })
    },

    // 删除分类
    deleteCate(rowData) {
      // 弹窗确认
      this.$confirm('此操作将永久删除该分类，是否继续？', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('categories/' + rowData.cat_id)
          if (res.meta.status !== 200) {
            this.$message.error('删除分类失败')
          }

          this.$message.success('删除分类成功')
          this.getCateList()
        })
        .catch(action => {
          this.$message({
            type: 'info',
            message: action === 'cancel' ? '取消删除' : '取消操作'
          })
        })
    }
  },
  created() {
    this.getCateList()
  }
}
</script>

<style lang="less" scoped>
.treeTable {
  margin-top: 15px;
}

.el-card {
  margin-top: 10px;
  max-height: 620px;
  overflow-y: auto;
}

.el-cascader {
  width: 100%;
}
</style>
