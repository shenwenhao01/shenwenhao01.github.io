# Gravity-Aware Monocular 3D Human-Object Reconstruction

![a](/Users/shenwenhao/shenwenhao01.github.io/_posts/2021-12-12-Gravity-Aware Monocular 3D Human-Object Reconstruction.assets/a.png)

本文主要关注了有物体自由飞行（抛物线运动）的场景，通过**单目 RGB 视频在绝对单位（“米”）上重建人体3D动作**，并且捕捉出**物体3D运动轨迹**。和现有的方法相比，GraviCap可以在“米”单位上恢复出人体骨骼绝对长度和物体运动轨迹，包括地面的方向。

本文**主要贡献**：

- GRAVICAP：一种 3D 人体动作捕捉和 3D 抛物运动物体轨迹的新方法；
- 能够改善人体3D姿态估计的新方法，并且首次实现能够从单目RGB视频恢复运动物体、人体相对于相机的绝对距离；
- 一个新的人体、物体互动的数据集以供评测，其中标注了人体3D姿态和物体运动轨迹；

**多视角的篮球捕捉直接调用opencv库😭**

# 1 Introduction

最近有一些基于物理规律的从单目RGB视频进行人体姿态估计的方法[1, 2]，他们通过重力、摩擦力的约束优化了人体的姿态估计。但是这些方法无法模拟人与物体的交互，因为没有利用好人体的先验信息，他们没能在绝对数量级上（以“米”为单位）估计人体的姿态和场景的维度。

本文的**核心发现**如下：

1. 假设帧率和重力向量已知，抛物运动的物理限制足以恢复该物体的 3D 轨迹；
2. 如果知道重力大小和相机焦距，则可以知道场景的绝对大小和地平面的方向（假设重力方向和地平面垂直）；
3. 定位人和飞行物体的相对关系可以优化人体 3D 动作捕捉；

大致流程如图一所示

- 输入：物体几何中心的 2D 坐标、人体 2D 关键点位置、初始（未受重力约束的）人体 3D 姿态（pose）
- 然后多帧合起来最小化目标方程
- 获得一个或多个episode（一次抛物飞行）物体的 3D 轨迹和优化后的 3D 人体姿态

GRAVICAP在 3D human motion capture 任务上取得了 SOTA 的效果。

# 2 Approach

## 2**.1 Recovering the 3D Object Trajectory**

假设： 已知 $N$ 帧的视频 $\mathcal{I} = \left\{\mathcal{I}{1}, \mathcal{I}{2}, \ldots, \mathcal{I}*{N}\right\}$，视频帧率为 $r$，相机焦距 $f$ 和 物体每一帧的 2D 位置 $\mathbf{b}=\left\{b*{1}, b_{2}, \ldots b_{N}\right\}$，其中 $b_i = (x_i, y_i)$

目标是求： 恢复物体的 3D 轨迹 $B=\left\{B_{1}, B_{2}, \ldots B_{N}\right\}$，其中 $B_{i}=\left(X_{i}, Y_{i}, Z_{i}\right)$ 表示该物体在相对相机的 3D 空间的位置

物体初速度：$\vec{u}=\left(u_{x}, u_{y}, u_{z}\right)$，重力矢量表示为 $\vec{g}=\left(g_{x}, g_{y}, g_{z}\right)$，根据牛顿运动学：

$$B_{i}=B_{0}+\vec{u} t+\frac{1}{2} \vec{g} t^{2}$$

其中，$t=i/r$ 是以秒为单位的时间戳。

根据针孔相机模型，我们可以有以下方程描述物体运动轨迹：

$$\begin{array}{r} x_{i}=f \frac{X_{i}}{Z_{i}}+c_{x}, y_{i}=f \frac{Y_{i}}{Z_{i}}+c_{y}, \forall i \\ \text { s. t. } \sqrt{g_{x}^{2}+g_{y}^{2}+g_{z}^{2}}=9.81 \mathrm{~m} / \mathrm{s}^{2} \end{array}$$

上述公式有 $3N$ 个未知参数$(X_i, Y_i, Z_i)$，使用下面的方程可以减少到 6 个未知参数：

$$\left\{\begin{array}{l} X_{i}=X_{0}+u_{x} t+\frac{1}{2} g_{x} t^{2} \\ Y_{i}=Y_{0}+u_{y} t+\frac{1}{2} g_{y} t^{2} \\ Z_{i}=Z_{0}+u_{z} t+\frac{1}{2} g_{z} t^{2} \end{array}\right.$$

直接假设重力的大小已知 $9.81m/s$，因为在这里这个数值并不重要。现在还可以分两种情况：1）重力方向已知，和地面垂直；2）重力方向未知，需要 N>4 才能解出方程。实际操作中，为了减少观测误差（物体重心位置不准确等），推荐 N>10。下面这张表格展示了不同情况的输入输出。

<img src="/Users/shenwenhao/shenwenhao01.github.io/_posts/2021-12-12-Gravity-Aware Monocular 3D Human-Object Reconstruction.assets/b.png" alt="b" style="zoom:50%;" />

最后，**最小化目标函数 $E_{b}=E_{b}\left(B_{0}, \vec{u}, f, \vec{g}\right)$**，通过上面的方程解出 $B_{0}, \vec{u}$（以及$f, \vec g$）。

$$\begin{equation} E_b=\arg \underset{B_{0}, \vec{u}, f, \vec{g}}{\min } \sum_{i}\left\|\left[\begin{array}{l} x_{i} \\ y_{i} \end{array}\right]-\left[\begin{array}{l} f \frac{X_{i}}{Z_{i}}+c_{x} \\ f \frac{Y_{i}}{Z_{i}}+c_{y} \end{array}\right]\right\|_{2}^{2} \end{equation}$$

注意这里结果的单位都是绝对单位（$m, m/s$）。

尽管上面的方程可以解出来，但是误差仍然比较大，下面展示人体和物体的重建相互改进的过程。

## 2.2 **Joint 3D Human-Object Reconstruction**

由于物体飞行轨迹可以估计出绝对长度，我们可以把人体和物体联系到一起，这样就可以同时优化人体姿态和物体飞行轨迹。

首先，我们需要使用一些现有的方法单独恢复出人体的 3D 关键点 $P^{\mathrm{kin}} = \left\{P_{1}^{\mathrm{kin}}, P_{2}^{\mathrm{kin}}, \ldots, P_{N}^{\mathrm{kin}}\right\}$，其中 $P_{i}^{\text {kin }} \in \mathbb{R}^{K \times 3}$ 并且关键点数 $K=16$。每一帧第 $k$ 个关键点的 3D 坐标分量分别表示为：$P_{i, k, x}^{\text {kin }}, P_{i, k, y}^{\text {kin }}, P_{i, k, z}^{\text {kin }}$。当然这些现有的方法无法提供绝对数量级的估计而且看上去不是很自然。

具体地说，先用 RMPE(AlphaPose) 方法检测出人体 2D 关键点 $p = \{p_1,p_2,...p_N\}$， 其中 $p_{i} \in \mathbb{R}^{K \times 2}$。而同一个人相对于根关键点的 3D 姿态（root-relative pose）$P^{\mathrm{kin}}$ 使用现成的方法[3]得到。

现在我们的目标是恢复骨长 $l = \left\{l_{1}, l_{2}, \ldots, l_{K-1}\right\}$，使得 root-relative 3D poses $s(P^{\mathrm{kin}}, l)$ 估计出绝对长度并且和解剖学上的长度保持一致。$s(·, ·)$ 运算使用骨骼长度 $l$ 计算修正 $P^{\mathrm{kin}}$ 的骨骼长度，从而解出 $P^{\mathrm{kin}}$ 的绝对尺度。此外，我们也要估计正确的 人体根关键点相对于相机的平移量 $t^{\text {corr }}=\left\{t_{1}^{\text {corr }}, t_{2}^{\text {corr }}, \ldots, t_{N}^{\text {corr }}\right\}$，其中 $t_{i}^{\text {corr }}=\left(t_{i, x}^{\text {corr }}, t_{i, y}^{\text {cor }}, t_{i, z}^{\text {corr }}\right)$。所以，绝对尺度上的相对相机的人体 pose 表示成：$P=s\left(P^{\text {kin }}, l\right)+t^{\text {corr }}$。

因为在飞行开始的时候，人和物体是接触的，人和物体的scale（包括绝对的和相对的）是一样的，这样就可以消除人体 scale 的歧义。

**最小化目标函数 $E_{p}=E_{p}\left(l, t_{i}^{\text {corr }}\right)$** ，恢复人体相对于相机的绝对 pose

$$\begin{equation}\arg \min *{l, t^{corr}} \sum*{i, k}\left \| \left[\begin{array}{c} p_{i, k}^{x} \\ p_{i, k}^{y} \end{array}\right]- \left[\begin{array}{l} f \frac{s\left(P_{i, k}^{\mathrm{kin}}, l\right)[x]+t_{i, x}^{\text {corr }}}{s\left(P_{i, k}^{\mathrm{kin}}, l\right)[z]+t_{i, z}^{\text {corr }}}+c_{x} \\ f \frac{s\left(P_{i, k}^{\mathrm{kin}}, l\right)[y]+t_{i, y}^{\text {corr }}}{s\left(P_{i, k}^{\mathrm{kin}}, l\right)[z]+t_{i, z}^{\text {corr }}}+c_{y} \end{array}\right] \right \|_{2}^{2}\end{equation}$$

上式有 $2NK$ 个等式，和 $(3N+K)$ 个未知量（3N 个 root translation，K-1 个 bone length，1个 focal length）。但是如果仅考虑 $E_p$，忽略 $E_b$，则会使得尺度有歧义，因为骨骼长度和根关键点偏移量会互相干扰。

<img src="/Users/shenwenhao/shenwenhao01.github.io/_posts/2021-12-12-Gravity-Aware Monocular 3D Human-Object Reconstruction.assets/c.png" alt="c" style="zoom:50%;" />

所以，我们通过以下两个方法解决这些问题：

- 使用人体骨骼长度先验信息、使用骨骼长度对称性限制；
- 把人体绝对姿态（pose）和物体飞行轨迹绑定到一起，添加两个限制；

### 2.2.1 **Constraints on Human Skeleton**

第一个限制使得估计出的骨骼长度接近人体平均的骨骼长度 $\bar{l}=\left\{\bar{l}_{k}\right\}$。平均骨骼长度使用了 MPI-INF-3DHP 采集到的平均长度。

**最小化目标函数 $E_{bl}(l)$:**

$$\begin{equation}\arg \min {l} E{b l}(l)=\arg \min *{l} \sum*{k}^{K-1}\left\|l_{k}-\bar{l}*{k}\right\|*{2}^{2}\end{equation}$$

此外，我们还要确保恢复出来的 l 是左右对称的，需要纠正初始的 $P_i^{\text {kin }}$。

**最小化目标函数 $E_s(l)$:**

$$\begin{equation}\arg \min *{l} E*{s}(l)=\arg \min *{l} \sum*{i, j \in \mathcal{S}}\left\|l_{i}-l_{j}\right\|_{2}^{2}\end{equation}$$

其中，$\mathcal{S}$ 表示对称的骨骼集合。

### 2.2.2 **Human Contact and Localisation Constraints**

**接触目标函数 $E_c(P)$** 体现了人扔或接物体的先验信息（人和物体在接触的时候是靠近的）

$$\begin{equation}\arg \min *{\vec{u}, \vec{g}, B*{0}} E_{c}(P)=\arg \min *{\vec{u}, \vec{g}, B*{0}} \sum_{(c, t) \in \mathcal{C}}\left\|P_{t}^{c}-B_{t}\right\|_{2}^{2}\end{equation}$$

其中，$\mathcal C$ 表示在 $t$ 时刻与物体接触的人体关键点集合，而 $P_t^c$ 表示这些关键点的 3D 坐标。

尽管（5）式把物体的飞行轨迹和人体在接球的瞬间的的绝对位置绑定到一起，但是在其余的时刻无法做出限制，另外，这个方程也不能适用于人和球没有靠得很近的场景（例如用球拍击乒乓球）。

为了解决上面提到的问题，这里又定义了一个 **人物交互目标函数 $E_m$**，用来确保第 $i$ 帧中，物体的 3D 位置指向人体 3D 躯干关键点之间的 3D 向量 在投影到像平面之后 和观测到的相应点的 2D 向量保持一致。

$E_{m}=E_{m}\left(B_{0}, \vec{u}, f, \vec{g}, l, t^{\text {corr }}\right)$，选取的躯干关键点是 骨盆、脊柱、脖子、肩膀，因为这些点相对相机的平移量相对稳定。、

$$\begin{equation} \arg \min *{B*{0}, \vec{u}, f, \vec{g}, l, t^{\text {corr }}} \sum_{i} \sum_{j \in \mathcal{T}} \sum_{m}^{M}\left\|\mathbf{d}*{i, j, m}^{2 D}-\Pi*{f}\left(\mathbf{d}*{i, j, m}^{3D}\right)\right\|*{2}^{2} \end{equation}$$

$$\text{where} \quad \mathbf{d}*{i, j, m}^{2 D}=p*{i, j}+\frac{m\left(b_{i, j}-p_{i, j}\right)}{M}\quad , \text{and} \quad \mathbf d_{i, j, m}^{3 D}=P_{i, j}+\frac{m\left(B_{i, j}-P_{i, j}\right)}{M}$$

$\mathcal{T}$ 表示关键点的集合。注意，我们在重投影后的像平面优化这些 3D 向量，这样的优化同时也会影响相应关键点 j 的准确度，实际操作中，我们均匀的采样 $M$ 个关键点，并且计算重投影误差。

<img src="/Users/shenwenhao/shenwenhao01.github.io/_posts/2021-12-12-Gravity-Aware Monocular 3D Human-Object Reconstruction.assets/d.png" alt="d" style="zoom:50%;" />

### 2.2.3 **Multi-Episodes and Multi-Person Settings**

## 2**.3 Joint Energy Optimisation**

# 3 **Dataset for 3D Human-Object Recovery**

# 4 Experiments

> [1] Davis Rempe, Leonidas J Guibas, Aaron Hertzmann, Bryan Russell, Ruben Villegas, and Jimei Yang. Contact and human dynamics from monocular video. In *European Conference on Computer Vision (ECCV)*, 2020. [2] SoshiShimada,VladislavGolyanik,WeipengXu,andChristian Theobalt. Physcap: physically plausible monocular 3d motion capture in real time. *ACM Transactions on Graphics (TOG)*, 39(6), 2020. [3]Dushyant Mehta, Srinath Sridhar, Oleksandr Sotnychenko, Helge Rhodin, Mohammad Shafiei, Hans-Peter Seidel, Weipeng Xu, Dan Casas, and Christian Theobalt. Vnect:Real-time 3d human pose estimation with a single rgb camera. *ACM Transactions on Graphics*, 2017.