<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="setAddRoles">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" stripe>
        <!-- 展开列 -->
        <el-table-column label="扩展" type="expand">
          <template slot-scope="scope">
            <el-row :class="['bdbottom',i1 === 0 ? 'bdtop':'','vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过 for 循环渲染二级权限 -->
                <el-row :class="[i2 === 0 ? '' : 'bdtop','vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>

                  <el-col :span="18">
                    <el-tag type="warning" v-for="(item3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <!-- <pre>{{scope.row}}</pre> -->
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="序号" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button size="mini" type="primary" icon="el-icon-edit" @click="setEditDialog(scope.row.id)">编辑</el-button>
            <el-button size="mini" type="danger" icon="el-icon-delete" @click="deleteRole(scope.row.id)">删除</el-button>
            <el-button size="mini" type="warning" icon="el-icon-setting" @click="setRightDialogVisible(scope.row)">分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="showSetRightDialog" width="50%" :top="'50px'" @close="setRightDialogClosed">
      <!-- 树型控件 -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox node-key="id" default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showSetRightDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="showAddRolesDialog" width="50%" @close="addRoleDialogClosed" :modal-append-to-body="true">
      <!-- 添加角色表单 -->
      <el-form :model="addRole" :rules="addRoleRules" ref="addRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRole.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRole.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitAddRoleForm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog title="修改角色" :visible.sync="showEditRolesDialog" width="50%" @close="editRoleDialogClosed">
      <!-- 添加角色表单 -->
      <el-form :model="editForm" :rules="addRoleRules" ref="editRoleRef" label-width="80px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>

        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="showEditRolesDialog = false">取 消</el-button>
        <el-button type="primary" @click="submitEditRoleForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表数据
      roleList: [],

      // 控制分配权限
      showSetRightDialog: false,

      // 所有权限的数据
      rightsList: [],

      // 树形控件的绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },

      // 默认选择的节点Id数值
      defKeys: [],
      // 当前即将分配权限的Id
      roleId: '',

      // 显示添加角色列表
      showAddRolesDialog: false,

      // 添加的用户
      addRole: {
        roleName: '',
        roleDesc: ''
      },

      // 添加用户表单规则
      addRoleRules: {
        roleName: [{ required: true, message: '请角色名称', trigger: 'blur' }]
      },

      // 修改的用户
      editForm: {},

      // 显示修改用户表单
      showEditRolesDialog: false
    }
  },
  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }

      this.roleList = res.data
      console.log(this.roleList)
    },
    // 根据Id删除对应的权限
    removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      this.$confirm('是否要删除该权限，是否继续？', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${role.id}/rights/${rightId}`
          )
          if (res.meta.status !== 200) {
            return this.$message.error('删除权限失败')
          }
          this.$message.success('删除权限成功')
          role.children = res.data
        })
        .catch(action => {
          this.$message({
            type: 'info',
            message: action === 'cancel' ? '取消删除' : '取消操作'
          })
        })
    },
    // 展示对话权限的对话框
    async setRightDialogVisible(role) {
      this.roleId = role.id
      // 获取所有权限数据
      const { data: res } = await this.$http.get('rights/tree')

      if (res.meta.status !== 200) {
        return this.$message.error('获取权限失败')
      }
      // 获取到的权限数据保存得到data中
      this.rightsList = res.data
      console.log(this.rightsList)

      // 递归获取三级节点Id
      this.getLeafKeys(role, this.defKeys)
      this.showSetRightDialog = true
    },

    // 通过递归的形式获取角色下三级权限的Id，并保存到 defKeys 数组中
    getLeafKeys(node, arr) {
      // 如果当前 node 节点不包含children 属性，则是三级节点
      if (!node.children) {
        arr.push(node.id)
        return
      }

      node.children.forEach(item => this.getLeafKeys(item, arr))
    },

    // 监听权限管理面板的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },

    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      console.log(idStr)
      const { data: res } = await this.$http.post(
        `roles/${this.roleId}/rights`,
        { rids: idStr }
      )
      if (res.meta.status !== 200) {
        this.$message.error('分配权限失败')
        return
      }

      this.$message.success('分配权限成功')
      this.getRolesList()
      this.showSetRightDialog = false
    },

    // 显示添加用户表单
    setAddRoles() {
      this.showAddRolesDialog = true
    },

    // 关闭添加用户表单
    addRoleDialogClosed() {
      this.showAddRolesDialog = false
      if (this.addRole.roleName !== '' || this.addRole.roleDesc !== '') {
        this.$confirm(
          '检测到未保存的内容，是否在取消操作前保存修改？',
          '确认信息',
          {
            distinguishCancelAndClose: true,
            confirmButtonText: '保存',
            cancelButtonText: '放弃修改'
          }
        )
          .then(() => {
            this.$message({
              type: 'info',
              message: '保存修改'
            })
          })
          .catch(action => {
            this.$message({
              type: 'info',
              message:
                action === 'cancel'
                  ? (this.$refs.addRoleRef.resetFields(), '表格已重置')
                  : '表格已暂时保存'
            })
          })
      } else {
        this.$refs.addRoleRef.resetFields()
      }
    },

    // 提交表单
    submitAddRoleForm() {
      this.$refs.addRoleRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post('roles', this.addRole)

        if (res.meta.status !== 201) {
          console.log(res)
          return this.$message.error('添加角色失败')
        }
        this.$refs.addRoleRef.resetFields()
        this.showAddRolesDialog = false
        this.getRolesList()
        this.$message.success('添加角色成功！')
      })
    },

    // 打开编辑角色表单
    async setEditDialog(id) {
      this.showEditRolesDialog = true
      console.log(id)
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色信息失败')
      }
      this.editForm = res.data
    },

    // 关闭编辑角色表单
    editRoleDialogClosed() {
      this.$refs.editRoleRef.resetFields()
    },

    // 提交修改角色表单
    submitEditRoleForm() {
      this.$refs.editRoleRef.validate(async valid => {
        console.log(valid)
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )

        if (res.meta.status !== 200) {
          console.log(res)
          return this.$message.error('修改角色失败')
        }
        this.showEditRolesDialog = false
        this.getRolesList()
      })
    },

    // 删除角色
    deleteRole(id) {
      // 弹窗确认
      this.$confirm('此操作将永久删除该角色，是否继续？', '提示', {
        distinguishCancelAndClose: true,
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      })
        .then(async () => {
          const { data: res } = await this.$http.delete('roles/' + id)
          if (res.meta.status !== 200) {
            this.$message.error('删除用户失败')
          }

          this.$message.success('删除用户成功')
          this.getRolesList()
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
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped>

.el-card {
  margin-top: 20px;
  max-height: 600px;
  overflow-y: auto;
}

.el-tag {
  margin: 7px;
}

.el-tree {
  max-height: 400px;
  overflow: auto;
}

.bdtop {
  border-top: 1px solid #eeeeee;
}

.bdbottom {
  border-bottom: 1px solid #eeeeee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
