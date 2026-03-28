---
name: content-import-validator
description: Build import scripts, validators, consistency checks, and generated content workflows for a JRPG remake project. / 为 JRPG 重制项目构建导入脚本、校验器、一致性检查和生成内容工作流。
---

Rules / 规则:
1. content/source is input only. / `content/source` 只能作为输入源。
2. content/generated is generated only. / `content/generated` 只能存放生成产物。
3. content/manual is curated override or supplement. / `content/manual` 用于人工维护的覆盖内容或补充内容。
4. Import scripts must be repeatable and deterministic. / 导入脚本必须可重复执行且结果确定。
5. Validation failures must point to exact files and fields. / 校验失败必须指向准确的文件和字段。
